/* eslint-disable @typescript-eslint/no-var-requires */
import type { Document } from './bson';
import { type Stream } from './cmap/connect';
import type { ProxyOptions } from './cmap/connection';
import { MongoMissingDependencyError } from './error';
import type { MongoClient } from './mongo_client';
import type { Callback } from './utils';

function makeErrorModule(error: any) {
  const props = error ? { kModuleError: error } : {};
  return new Proxy(props, {
    get: (_: any, key: any) => {
      if (key === 'kModuleError') {
        return error;
      }
      throw error;
    },
    set: () => {
      throw error;
    }
  });
}

export let Kerberos: typeof import('kerberos') | { kModuleError: MongoMissingDependencyError } =
  makeErrorModule(
    new MongoMissingDependencyError(
      'Optional module `kerberos` not found. Please install it to enable kerberos authentication'
    )
  );

export function getKerberos(): typeof Kerberos | { kModuleError: MongoMissingDependencyError } {
  try {
    // Ensure you always wrap an optional require in the try block NODE-3199
    Kerberos = require('kerberos');
    return Kerberos;
  } catch {
    return Kerberos;
  }
}

export interface KerberosClient {
  step(challenge: string): Promise<string>;
  step(challenge: string, callback: Callback<string>): void;
  wrap(challenge: string, options: { user: string }): Promise<string>;
  wrap(challenge: string, options: { user: string }, callback: Callback<string>): void;
  unwrap(challenge: string): Promise<string>;
  unwrap(challenge: string, callback: Callback<string>): void;
}

type ZStandardLib = {
  /**
   * Compress using zstd.
   * @param buf - Buffer to be compressed.
   */
  compress(buf: Buffer, level?: number): Promise<Buffer>;

  /**
   * Decompress using zstd.
   */
  decompress(buf: Buffer): Promise<Buffer>;
};

export let ZStandard: ZStandardLib | { kModuleError: MongoMissingDependencyError } =
  makeErrorModule(
    new MongoMissingDependencyError(
      'Optional module `@mongodb-js/zstd` not found. Please install it to enable zstd compression'
    )
  );

export function getZstdLibrary(): typeof ZStandard | { kModuleError: MongoMissingDependencyError } {
  try {
    ZStandard = require('@mongodb-js/zstd');
    return ZStandard;
  } catch {
    return ZStandard;
  }
}

/**
 * @internal
 * Copy of the AwsCredentialIdentityProvider interface from [`smithy/types`](https://socket.dev/npm/package/\@smithy/types/files/1.1.1/dist-types/identity/awsCredentialIdentity.d.ts),
 * the return type of the aws-sdk's `fromNodeProviderChain().provider()`.
 */
export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration?: Date;
}

type CredentialProvider = {
  fromNodeProviderChain(this: void): () => Promise<AWSCredentials>;
};

export function getAwsCredentialProvider():
  | CredentialProvider
  | { kModuleError: MongoMissingDependencyError } {
  try {
    // Ensure you always wrap an optional require in the try block NODE-3199
    const credentialProvider = require('@aws-sdk/credential-providers');
    return credentialProvider;
  } catch {
    return makeErrorModule(
      new MongoMissingDependencyError(
        'Optional module `@aws-sdk/credential-providers` not found.' +
          ' Please install it to enable getting aws credentials via the official sdk.'
      )
    );
  }
}

/** @internal */
export type GcpMetadata =
  | typeof import('gcp-metadata')
  | { kModuleError: MongoMissingDependencyError };

export function getGcpMetadata(): GcpMetadata {
  try {
    // Ensure you always wrap an optional require in the try block NODE-3199
    const credentialProvider = require('gcp-metadata');
    return credentialProvider;
  } catch {
    return makeErrorModule(
      new MongoMissingDependencyError(
        'Optional module `gcp-metadata` not found.' +
          ' Please install it to enable getting gcp credentials via the official sdk.'
      )
    );
  }
}

/** @internal */
export type SnappyLib = {
  /**
   * In order to support both we must check the return value of the function
   * @param buf - Buffer to be compressed
   */
  compress(buf: Buffer): Promise<Buffer>;

  /**
   * In order to support both we must check the return value of the function
   * @param buf - Buffer to be compressed
   */
  uncompress(buf: Buffer, opt: { asBuffer: true }): Promise<Buffer>;
};

export function getSnappy(): SnappyLib | { kModuleError: MongoMissingDependencyError } {
  try {
    // Ensure you always wrap an optional require in the try block NODE-3199
    const value = require('snappy');
    return value;
  } catch (cause) {
    const kModuleError = new MongoMissingDependencyError(
      'Optional module `snappy` not found. Please install it to enable snappy compression',
      { cause }
    );
    return { kModuleError };
  }
}

export type SocksLib = {
  SocksClient: {
    createConnection(options: {
      command: 'connect';
      destination: { host: string; port: number };
      proxy: {
        /** host and port are ignored because we pass existing_socket */
        host: 'iLoveJavaScript';
        port: 0;
        type: 5;
        userId?: string;
        password?: string;
      };
      timeout?: number;
      /** We always create our own socket, and pass it to this API for proxy negotiation */
      existing_socket: Stream;
    }): Promise<{ socket: Stream }>;
  };
};

export function getSocks(): SocksLib | { kModuleError: MongoMissingDependencyError } {
  try {
    // Ensure you always wrap an optional require in the try block NODE-3199
    const value = require('socks');
    return value;
  } catch (cause) {
    const kModuleError = new MongoMissingDependencyError(
      'Optional module `socks` not found. Please install it to connections over a SOCKS5 proxy',
      { cause }
    );
    return { kModuleError };
  }
}

export let saslprep: typeof import('saslprep') | { kModuleError: MongoMissingDependencyError } =
  makeErrorModule(
    new MongoMissingDependencyError(
      'Optional module `saslprep` not found.' +
        ' Please install it to enable Stringprep Profile for User Names and Passwords'
    )
  );

try {
  // Ensure you always wrap an optional require in the try block NODE-3199
  saslprep = require('saslprep');
} catch {} // eslint-disable-line

interface AWS4 {
  /**
   * Created these inline types to better assert future usage of this API
   * @param options - options for request
   * @param credentials - AWS credential details, sessionToken should be omitted entirely if its false-y
   */
  sign(
    this: void,
    options: {
      path: '/';
      body: string;
      host: string;
      method: 'POST';
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded';
        'Content-Length': number;
        'X-MongoDB-Server-Nonce': string;
        'X-MongoDB-GS2-CB-Flag': 'n';
      };
      service: string;
      region: string;
    },
    credentials:
      | {
          accessKeyId: string;
          secretAccessKey: string;
          sessionToken: string;
        }
      | {
          accessKeyId: string;
          secretAccessKey: string;
        }
      | undefined
  ): {
    headers: {
      Authorization: string;
      'X-Amz-Date': string;
    };
  };
}

export let aws4: AWS4 | { kModuleError: MongoMissingDependencyError } = makeErrorModule(
  new MongoMissingDependencyError(
    'Optional module `aws4` not found. Please install it to enable AWS authentication'
  )
);

try {
  // Ensure you always wrap an optional require in the try block NODE-3199
  aws4 = require('aws4');
} catch {} // eslint-disable-line

/** @public */
export const AutoEncryptionLoggerLevel = Object.freeze({
  FatalError: 0,
  Error: 1,
  Warning: 2,
  Info: 3,
  Trace: 4
} as const);

/** @public */
export type AutoEncryptionLoggerLevel =
  (typeof AutoEncryptionLoggerLevel)[keyof typeof AutoEncryptionLoggerLevel];

/** @public */
export interface AutoEncryptionTlsOptions {
  /**
   * Specifies the location of a local .pem file that contains
   * either the client's TLS/SSL certificate and key.
   */
  tlsCertificateKeyFile?: string;
  /**
   * Specifies the password to de-crypt the tlsCertificateKeyFile.
   */
  tlsCertificateKeyFilePassword?: string;
  /**
   * Specifies the location of a local .pem file that contains the
   * root certificate chain from the Certificate Authority.
   * This file is used to validate the certificate presented by the
   * KMS provider.
   */
  tlsCAFile?: string;
}

/** @public */
export interface AutoEncryptionOptions {
  /** @internal client for metadata lookups */
  metadataClient?: MongoClient;
  /** A `MongoClient` used to fetch keys from a key vault */
  keyVaultClient?: MongoClient;
  /** The namespace where keys are stored in the key vault */
  keyVaultNamespace?: string;
  /** Configuration options that are used by specific KMS providers during key generation, encryption, and decryption. */
  kmsProviders?: {
    /** Configuration options for using 'aws' as your KMS provider */
    aws?:
      | {
          /** The access key used for the AWS KMS provider */
          accessKeyId: string;
          /** The secret access key used for the AWS KMS provider */
          secretAccessKey: string;
          /**
           * An optional AWS session token that will be used as the
           * X-Amz-Security-Token header for AWS requests.
           */
          sessionToken?: string;
        }
      | Record<string, never>;
    /** Configuration options for using 'local' as your KMS provider */
    local?: {
      /**
       * The master key used to encrypt/decrypt data keys.
       * A 96-byte long Buffer or base64 encoded string.
       */
      key: Buffer | string;
    };
    /** Configuration options for using 'azure' as your KMS provider */
    azure?:
      | {
          /** The tenant ID identifies the organization for the account */
          tenantId: string;
          /** The client ID to authenticate a registered application */
          clientId: string;
          /** The client secret to authenticate a registered application */
          clientSecret: string;
          /**
           * If present, a host with optional port. E.g. "example.com" or "example.com:443".
           * This is optional, and only needed if customer is using a non-commercial Azure instance
           * (e.g. a government or China account, which use different URLs).
           * Defaults to "login.microsoftonline.com"
           */
          identityPlatformEndpoint?: string | undefined;
        }
      | {
          /**
           * If present, an access token to authenticate with Azure.
           */
          accessToken: string;
        }
      | Record<string, never>;
    /** Configuration options for using 'gcp' as your KMS provider */
    gcp?:
      | {
          /** The service account email to authenticate */
          email: string;
          /** A PKCS#8 encrypted key. This can either be a base64 string or a binary representation */
          privateKey: string | Buffer;
          /**
           * If present, a host with optional port. E.g. "example.com" or "example.com:443".
           * Defaults to "oauth2.googleapis.com"
           */
          endpoint?: string | undefined;
        }
      | {
          /**
           * If present, an access token to authenticate with GCP.
           */
          accessToken: string;
        }
      | Record<string, never>;
    /**
     * Configuration options for using 'kmip' as your KMS provider
     */
    kmip?: {
      /**
       * The output endpoint string.
       * The endpoint consists of a hostname and port separated by a colon.
       * E.g. "example.com:123". A port is always present.
       */
      endpoint?: string;
    };
  };
  /**
   * A map of namespaces to a local JSON schema for encryption
   *
   * **NOTE**: Supplying options.schemaMap provides more security than relying on JSON Schemas obtained from the server.
   * It protects against a malicious server advertising a false JSON Schema, which could trick the client into sending decrypted data that should be encrypted.
   * Schemas supplied in the schemaMap only apply to configuring automatic encryption for Client-Side Field Level Encryption.
   * Other validation rules in the JSON schema will not be enforced by the driver and will result in an error.
   */
  schemaMap?: Document;
  /** Supply a schema for the encrypted fields in the document  */
  encryptedFieldsMap?: Document;
  /** Allows the user to bypass auto encryption, maintaining implicit decryption */
  bypassAutoEncryption?: boolean;
  /** Allows users to bypass query analysis */
  bypassQueryAnalysis?: boolean;
  options?: {
    /** An optional hook to catch logging messages from the underlying encryption engine */
    logger?: (level: AutoEncryptionLoggerLevel, message: string) => void;
  };
  extraOptions?: {
    /**
     * A local process the driver communicates with to determine how to encrypt values in a command.
     * Defaults to "mongodb://%2Fvar%2Fmongocryptd.sock" if domain sockets are available or "mongodb://localhost:27020" otherwise
     */
    mongocryptdURI?: string;
    /** If true, autoEncryption will not attempt to spawn a mongocryptd before connecting  */
    mongocryptdBypassSpawn?: boolean;
    /** The path to the mongocryptd executable on the system */
    mongocryptdSpawnPath?: string;
    /** Command line arguments to use when auto-spawning a mongocryptd */
    mongocryptdSpawnArgs?: string[];
    /**
     * Full path to a MongoDB Crypt shared library to be used (instead of mongocryptd).
     *
     * This needs to be the path to the file itself, not a directory.
     * It can be an absolute or relative path. If the path is relative and
     * its first component is `$ORIGIN`, it will be replaced by the directory
     * containing the mongodb-client-encryption native addon file. Otherwise,
     * the path will be interpreted relative to the current working directory.
     *
     * Currently, loading different MongoDB Crypt shared library files from different
     * MongoClients in the same process is not supported.
     *
     * If this option is provided and no MongoDB Crypt shared library could be loaded
     * from the specified location, creating the MongoClient will fail.
     *
     * If this option is not provided and `cryptSharedLibRequired` is not specified,
     * the AutoEncrypter will attempt to spawn and/or use mongocryptd according
     * to the mongocryptd-specific `extraOptions` options.
     *
     * Specifying a path prevents mongocryptd from being used as a fallback.
     *
     * Requires the MongoDB Crypt shared library, available in MongoDB 6.0 or higher.
     */
    cryptSharedLibPath?: string;
    /**
     * If specified, never use mongocryptd and instead fail when the MongoDB Crypt
     * shared library could not be loaded.
     *
     * This is always true when `cryptSharedLibPath` is specified.
     *
     * Requires the MongoDB Crypt shared library, available in MongoDB 6.0 or higher.
     */
    cryptSharedLibRequired?: boolean;
    /**
     * Search paths for a MongoDB Crypt shared library to be used (instead of mongocryptd)
     * Only for driver testing!
     * @internal
     */
    cryptSharedLibSearchPaths?: string[];
  };
  proxyOptions?: ProxyOptions;
  /** The TLS options to use connecting to the KMS provider */
  tlsOptions?: {
    aws?: AutoEncryptionTlsOptions;
    local?: AutoEncryptionTlsOptions;
    azure?: AutoEncryptionTlsOptions;
    gcp?: AutoEncryptionTlsOptions;
    kmip?: AutoEncryptionTlsOptions;
  };
}

type MongoCrypt = { MongoCrypt: any };
/** A utility function to get the instance of mongodb-client-encryption, if it exists. */
export function getMongoDBClientEncryption(): MongoCrypt | null {
  let mongodbClientEncryption = null;

  try {
    // NOTE(NODE-3199): Ensure you always wrap an optional require literally in the try block
    // Cannot be moved to helper utility function, bundlers search and replace the actual require call
    // in a way that makes this line throw at bundle time, not runtime, catching here will make bundling succeed
    mongodbClientEncryption = require('mongodb-client-encryption');
  } catch {
    // ignore
  }

  return mongodbClientEncryption;
}

export type MongodbClientEncryption = ReturnType<typeof getMongoDBClientEncryption>;
