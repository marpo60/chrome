import * as cookie from 'cookie';
import * as express from 'express';
import * as fs from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import * as Joi from 'joi';
import * as _ from 'lodash';
import * as net from 'net';
import fetch from 'node-fetch';
import * as os from 'os';
import * as path from 'path';
import rmrf = require('rimraf');
import * as shortid from 'shortid';
import { PassThrough } from 'stream';
import * as url from 'url';
import * as util from 'util';

import { DEBUG } from './config';

const dbg = require('debug');

export const exists = util.promisify(fs.exists);
export const lstat = util.promisify(fs.lstat);
export const readdir = util.promisify(fs.readdir);
export const writeFile = util.promisify(fs.writeFile);
export const mkdir = util.promisify(fs.mkdir);
export const mkdtemp = util.promisify(fs.mkdtemp);
export const rimraf = util.promisify(rmrf);
export const getDebug = (level: string) => dbg(`browserless:${level}`);
export const id = shortid.generate;
export const canLog = DEBUG && DEBUG === '*';
const debug = getDebug('system');

type IUpgradeHandler = (req: IncomingMessage, socket: net.Socket, head: Buffer) => Promise<any>;
type IRequestHandler = (req: IncomingMessage, res: ServerResponse) => Promise<any>;

export const asyncWsHandler = (handler: IUpgradeHandler) => {
  return (req: IncomingMessage, socket: net.Socket, head: Buffer) => {
    Promise.resolve(handler(req, socket, head))
      .catch((error: Error) => {
        debug(`Error in WebSocket handler: ${error}`);
        socket.write([
          'HTTP/1.1 400 Bad Request',
          'Content-Type: text/plain; charset=UTF-8',
          'Content-Encoding: UTF-8',
          'Accept-Ranges: bytes',
          'Connection: keep-alive',
        ].join('\n') + '\n\n');
        socket.write('Bad Request, ', error.message);
        socket.end();
      });
  };
};

export const asyncWebHandler = (handler: IRequestHandler) => {
  return (req: express.Request, res: express.Response) => {
    Promise.resolve(handler(req, res))
      .catch((error) => {
        debug(`Error in route handler: ${error}`);
        res.status(400).send(error.message);
      });
  };
};

export const bodyValidation = (schema: Joi.Schema) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const header = req.header('content-type');
    if (header && !header.includes('json')) {
      return next();
    }

    const result = Joi.validate(req.body, schema);

    if (result.error) {
      debug(`Malformed incoming request: ${result.error}`);
      return res.status(400).send(result.error.details);
    }

    // Allow .defaults to work otherwise
    // Joi schemas default's won't apply
    req.body = result.value;

    return next();
  };
};

export const tokenCookieName = 'browserless_token';
export const codeCookieName = 'browserless_code';

export const isWebdriverAuthorized = (req: IncomingMessage, body: any, token: string) => {
  const authToken = (
    getBasicAuthToken(req) ||
    _.get(body, ['desiredCapabilities', 'browserless.token'], null)
  );

  if (authToken !== token) {
    return false;
  }

  return true;
};

export const isAuthorized = (req: express.Request | IncomingMessage, token: string) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  const parsedUrl = url.parse(req.url as string, true);
  const authToken = _.get(parsedUrl, 'query.token', null) ||
    getBasicAuthToken(req) ||
    cookies[tokenCookieName];

  if (authToken !== token) {
    return false;
  }

  return true;
};

export const fetchJson = (url: string, opts?: any) => fetch(url, opts)
  .then((res) => {
    if (!res.ok) { throw res; }
    return res.json();
  });

export const generateChromeTarget = () => {
  return `/devtools/page/${id()}`;
};

export const sleep = (time = 0) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

export const safeParse = (maybeJson: any) => {
  try {
    return JSON.parse(maybeJson);
  } catch {
    return null;
  }
};

export const attachBodyToRequest = (req: IncomingMessage, body: any) => {
  const bufferStream = new PassThrough();
  bufferStream.end(Buffer.from(body));

  Object.assign(req, bufferStream);
};

export const readRequestBody = async (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve) => {
    const body: Uint8Array[] = [];
    let hasResolved = false;

    const resolveNow = (results: any) => {
      if (hasResolved) {
        return;
      }
      hasResolved = true;
      attachBodyToRequest(req, results);
      resolve(results);
    };

    req
      .on('data', (chunk) => body.push(chunk))
      .on('end', () => {
        if (!req.complete || hasResolved) {
          resolveNow(null);
        }
        const final = Buffer.concat(body).toString();
        resolveNow(final);
      })
      .on('aborted', () => {
        resolveNow(null);
      })
      .on('error', () => {
        resolveNow(null);
      });
  });
};

export const getBasicAuthToken = (req: express.Request | IncomingMessage): string => {
  const header = req.headers.authorization || '';
  const token = header.split(/\s+/).pop() || '';
  return Buffer.from(token, 'base64').toString().replace(':', '');
};

export const fnLoader = (fnName: string) =>
  fs.readFileSync(path.join(__dirname, '..', 'functions', `${fnName}.js`), 'utf8');

export const browserlessDataDirPrefix = 'browserless-data-dir-';

export const getUserDataDir = () => mkdtemp(path.join(os.tmpdir(), browserlessDataDirPrefix));

export const clearBrowserlessDataDirs = () => rimraf(path.join(os.tmpdir(), `${browserlessDataDirPrefix}*`));
