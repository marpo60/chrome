# 1.9.0
- Better handling of browser/socket closing in puppeteer integrations.
- Numerous screencast fixes.
- Moved all GH links to new repo location.
- Dep updates.

# 1.8.0
- Better windows dev experience.
- Indian font support.
- Video capture now supports audio and browser width/height.
- Dependency updates.
- DEFAULT env variables for launching pre-booted Chrome.

# 1.7.0
- Dep updates
- New `?blockAds` query-parameter for disabling 3rd-party ad calls.

# 1.6.0
- New `authenticate` and `setExtraHTTPHeaders` params for the `content`, `pdf`, and `screenshot` APIs. Useful for using proxies in our REST APIs.
- Fixed a bunch of bugs inside of the webdriver integration, making it more REST-ful.
- Updated dependencies inside of Chromedriver.
- New `DISABLE_AUTO_SET_DOWNLOAD_BEHAVIOR` for mitigating errors in puppeteer < 1.15.0.
- Bumped Puppeteer to 1.15.0.

# 1.5.0
- New `/session` API (and accompanying routes) for display/viewing active sesions in a remote debugger(!).
- New `?pause` query-param for pausing sessions prior to running them (useful for the live debug viewer).
- The browserless debugger now exposes links to these debug pages via the sidebar.
- New Debugger page can be disabled via the `ENABLE_DEBUG_VIEWER=false` environment variable flag.
- Move to use `node@10`.
- No more `no-implicit-any`'s inside the codebase.

# 1.4.0
- During connection, we now set the download dir of REST and puppeteer sessions. Cloud users and docker users no longer have to manually set this field, and the `/workspace` API references it as well!

# 1.3.1

# Fixes
- New deploy.js file to do deployments "on-prem"
- Updated new builds for puppeteer 1.12.2 and 1.13.0
- Fixes an issues in CORS handling

# 1.3.0

# Minor changes
- The `screenshot`, `function`, `pdf`, and `content` API's now accept new content-types for easier POSTing of small payloads (see docsite).
- The `screencast` API can now start/stop recording programmatically via a `startScreencast` and `stopScreencast` params (see docsite).
- New `external` dir for injecting custom `before` and `after` hooks in external docker builds.
- A new `timeout` query-option for session-based timeouts vs using the global one.
- New `requestInterceptors` for injection custom request behavior.

# Fixes
- Numerous default fixes in the APIs.
- Stray consoles removed :)
- Consolidated download behavior in `screencast` and `download` APIs

# 1.2.0

# Minor Changes
- New `requestInterceptors` for the /screenshot API, [allowing you to mock data in response to a request](https://github.com/browserless/chrome/pull/119).
- Code debugger now transmits code over-the-wire via cookies to avoid URL max-length issues.
- Now supports cookie-based authentication via a `browserless_token=TOKEN;` cookie.

# Fixes
- [Comments in the debugger won't break it.](https://github.com/browserless/chrome/issues/118)
- Requests that are rejected due to auth reasons aren't logged in stats.

# 1.1.0

With 1.1.0 we offer a refined way of dealing with both downloads and uploads. Both use-cases are tightly coupled to the file-system, and can leave you scratching your head as to what's going one. For more information and detailed documentation, please refer to our doc-site at https://docs.browserless.io/

## Minor Changes
- New `WORKSPACE_DIR` variable for controlling where browserless stores files and uploads.
- New `/workspace` API for doing RESTful operations on the downloads/uploads file-system.
- New `/download` API for running a puppeteer-script, and responding with the resulting downloaded file.

## Internal Changes
- Moved routes out of the browserless module and into their own file/module.
- Renamed the `browserless-web-service` module to just `browserless` for simplicity.
- Moved the `DOWNLOAD_DIR` to `WORKSPACE_DIR` since it handles both uploads and downloads.

# 1.0.0

🥁 -- Stable version 1.0 is here! While this doesn't include major functionality changes, it _does_ change how the docker builds are generated going forward. The versioning will now contain two pieces of crucial information: the version of the _browserless_ service + the version of Chrome under-the-hood. For instance `1.2.3-puppeteer-1.10.0` is browserless at `1.2.3`, exposing puppeteer at `1.10.0`.

Similar to how NodeJS itself does docker releases, we'll now provide releases in 3 distinct ways:

- An _immutable_, pinned version release: `1.0.0-puppeteer-1.11.0`
- A mutable minor version release: `1.1-puppeteer-1.12.0`
- A mutable major version release: `1-puppeteer-1.9.0`

For production deployments, we recommend using _pinned_ version releases as they won't change once released. The mutable minor/major releases will receive on-going updates whenever we do changes that are bug-fixes or feature release. Even with the best intentions it's possible that instability can be introduced with these mutable images, hence why recommend the pinned version releases.

Finally, we'll continue to ship support for the last 5 minor versions of Puppeteer + the Google Chrome (stable). Old images will remain, but newer versions of browserless won't be included.

We'll continue to keep this changelog up-to-date anytime we do docker releases.
