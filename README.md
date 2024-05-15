# WarpCache Action

This action allows caching dependencies and build outputs to improve workflow execution time.

>Two other actions are available in addition to the primary `cache` action:
>
>* [Restore action](./restore/README.md)
>* [Save action](./save/README.md)

[![Tests](https://github.com/WarpBuilds/cache/actions/workflows/workflow.yml/badge.svg)](https://github.com/WarpBuilds/cache/actions/workflows/workflow.yml)

## Documentation

WarpCache is a performant drop-in replacement to GitHub's actions/cache. See Performance comparison @ [WarpBuild Docs](https://docs.warpbuild.com/cache#performance)

For more information on how to leverage caching in GitHub workflows, see ["Caching dependencies to speed up workflows"](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows).

## What's New

### v1

* Provides feature parity with GitHub's `actions/cache` v4.
* Provides unlimited cache for a repo.
* Supports `enableCrossArchArchive` to allow runners to save or restore caches that can be restored or saved respectively on runners of other architectures.
* Allows `delete-cache` input to delete the cache from the action directly.

## Usage

### Pre-requisites

WarpCache will only work when used with WarpBuild's Runners. Sign up @ [https://www.warpbuild.com/](https://www.warpbuild.com/).

Create a workflow `.yml` file in your repository's `.github/workflows` directory. An [example workflow](#example-cache-workflow) is available below. For more information, see the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs

* `key` - An explicit key for a cache entry. See [creating a cache key](#creating-a-cache-key).
* `path` - A list of files, directories, and wildcard patterns to cache and restore. See [`@actions/glob`](https://github.com/actions/toolkit/tree/main/packages/glob) for supported patterns.
* `restore-keys` - An ordered list of prefix-matched keys to use for restoring stale cache if no cache hit occurred for key.
* `enableCrossOsArchive` - An optional boolean when enabled, allows Windows runners to save or restore caches that can be restored or saved respectively on other platforms. Default: `false`
* `enableCrossArchArchive` - An optional boolean when enabled, allows runners to save or restore caches that can be restored or saved respectively on runners of other architectures. Default: `false`
* `fail-on-cache-miss` - Fail the workflow if cache entry is not found. Default: `false`
* `lookup-only` - If true, only checks if cache entry exists and skips download. Does not change save cache behavior. Default: `false`
* `delete-cache` - If true, deletes the cache entry. Skips restore and save. Default: `false`

#### Environment Variables

* `SEGMENT_DOWNLOAD_TIMEOUT_MINS` - Segment download timeout (in minutes, default `10`) to abort download of the segment if not completed in the defined number of minutes. [Read more](https://github.com/actions/cache/blob/main/tips-and-workarounds.md#cache-segment-restore-timeout)

### Outputs

* `cache-hit` - A boolean value to indicate an exact match was found for the key.

    > **Note** `cache-hit` will only be set to `true` when a cache hit occurs for the exact `key` match. For a partial key match via `restore-keys` or a cache miss, it will be set to `false`.

See [Skipping steps based on cache-hit](#skipping-steps-based-on-cache-hit) for info on using this output

### Cache scopes

The cache is scoped to the key, [version](#cache-version), and branch.

See [Matching a cache key](https://help.github.com/en/actions/configuring-and-managing-workflows/caching-dependencies-to-speed-up-workflows#matching-a-cache-key) for more info.

### Example cache workflow

#### Restoring and saving cache using a single action

```yaml
name: Caching Primes

on: push

jobs:
  build:
    runs-on: warp-ubuntu-latest-x64-4x

    steps:
    - uses: actions/checkout@v3

    - name: Cache Primes
      id: cache-primes
      uses: WarpBuilds/cache@v1
      with:
        path: prime-numbers
        key: ${{ runner.os }}-primes

    - name: Generate Prime Numbers
      if: steps.cache-primes.outputs.cache-hit != 'true'
      run: /generate-primes.sh -d prime-numbers

    - name: Use Prime Numbers
      run: /primes.sh -d prime-numbers
```

The `cache` action provides a `cache-hit` output which is set to `true` when the cache is restored using the primary `key` and `false` when the cache is restored using `restore-keys` or no cache is restored.

#### Using a combination of restore and save actions

```yaml
name: Caching Primes

on: push

jobs:
  build:
    runs-on: warp-ubuntu-latest-x64-4x

    steps:
    - uses: actions/checkout@v3

    - name: Restore cached Primes
      id: cache-primes-restore
      uses: WarpBuilds/cache/restore@v1
      with:
        path: |
          path/to/dependencies
          some/other/dependencies
        key: ${{ runner.os }}-primes
    .
    . //intermediate workflow steps
    .
    - name: Save Primes
      id: cache-primes-save
      uses: WarpBuilds/cache/save@v1
      with:
        path: |
          path/to/dependencies
          some/other/dependencies
        key: ${{ steps.cache-primes-restore.outputs.cache-primary-key }}
```

> **Note**
> You must use the `cache` or `restore` action in your workflow before you need to use the files that might be restored from the cache. If the provided `key` matches an existing cache, a new cache is not created and if the provided `key` doesn't match an existing cache, a new cache is automatically created provided the job completes successfully.

## Caching Strategies

With the introduction of the `restore` and `save` actions, a lot of caching use cases can now be achieved. Please see the [caching strategies](./caching-strategies.md) document for understanding how you can use the actions strategically to achieve the desired goal.

## Implementation Examples

Every programming language and framework has its own way of caching.

See [Examples](examples.md) for a list of `WarpBuilds/cache` implementations for use with:

* [C# - NuGet](./examples.md#c---nuget)
* [Clojure - Lein Deps](./examples.md#clojure---lein-deps)
* [D - DUB](./examples.md#d---dub)
* [Deno](./examples.md#deno)
* [Elixir - Mix](./examples.md#elixir---mix)
* [Go - Modules](./examples.md#go---modules)
* [Haskell - Cabal](./examples.md#haskell---cabal)
* [Haskell - Stack](./examples.md#haskell---stack)
* [Java - Gradle](./examples.md#java---gradle)
* [Java - Maven](./examples.md#java---maven)
* [Node - npm](./examples.md#node---npm)
* [Node - Lerna](./examples.md#node---lerna)
* [Node - Yarn](./examples.md#node---yarn)
* [OCaml/Reason - esy](./examples.md#ocamlreason---esy)
* [PHP - Composer](./examples.md#php---composer)
* [Python - pip](./examples.md#python---pip)
* [Python - pipenv](./examples.md#python---pipenv)
* [R - renv](./examples.md#r---renv)
* [Ruby - Bundler](./examples.md#ruby---bundler)
* [Rust - Cargo](./examples.md#rust---cargo)
* [Scala - SBT](./examples.md#scala---sbt)
* [Swift, Objective-C - Carthage](./examples.md#swift-objective-c---carthage)
* [Swift, Objective-C - CocoaPods](./examples.md#swift-objective-c---cocoapods)
* [Swift - Swift Package Manager](./examples.md#swift---swift-package-manager)
* [Swift - Mint](./examples.md#swift---mint)

## Creating a cache key

A cache key can include any of the contexts, functions, literals, and operators supported by GitHub Actions.

For example, using the [`hashFiles`](https://docs.github.com/en/actions/learn-github-actions/expressions#hashfiles) function allows you to create a new cache when dependencies change.

```yaml
  - uses: WarpBuilds/cache@v1
    with:
      path: |
        path/to/dependencies
        some/other/dependencies
      key: ${{ runner.os }}-${{ hashFiles('**/lockfiles') }}
```

Additionally, you can use arbitrary command output in a cache key, such as a date or software version:

```yaml
  # http://man7.org/linux/man-pages/man1/date.1.html
  - name: Get Date
    id: get-date
    run: |
      echo "date=$(/bin/date -u "+%Y%m%d")" >> $GITHUB_OUTPUT
    shell: bash

  - uses: WarpBuilds/cache@v1
    with:
      path: path/to/dependencies
      key: ${{ runner.os }}-${{ steps.get-date.outputs.date }}-${{ hashFiles('**/lockfiles') }}
```

See [Using contexts to create cache keys](https://help.github.com/en/actions/configuring-and-managing-workflows/caching-dependencies-to-speed-up-workflows#using-contexts-to-create-cache-keys)

## Cache Limits

There is no enforced cache limit on WarpCache.

## Skipping steps based on cache-hit

Using the `cache-hit` output, subsequent steps (such as install or build) can be skipped when a cache hit occurs on the key.  It is recommended to install missing/updated dependencies in case of a partial key match when the key is dependent on the `hash` of the package file.

Example:

```yaml
steps:
  - uses: actions/checkout@v3

  - uses: WarpBuilds/cache@v1
    id: cache
    with:
      path: path/to/dependencies
      key: ${{ runner.os }}-${{ hashFiles('**/lockfiles') }}

  - name: Install Dependencies
    if: steps.cache.outputs.cache-hit != 'true'
    run: /install.sh
```

> **Note** The `id` defined in `WarpBuilds/cache` must match the `id` in the `if` statement (i.e. `steps.[ID].outputs.cache-hit`)

## Cache Version

Cache version is a hash [generated](https://github.com/actions/toolkit/blob/500d0b42fee2552ae9eeb5933091fe2fbf14e72d/packages/cache/src/internal/cacheHttpClient.ts#L73-L90) for a combination of compression tool used (Gzip, Zstd, etc. based on the runner OS) and the `path` of directories being cached. If two caches have different versions, they are identified as unique caches while matching. This, for example, means that a cache created on a `warp-macos-14-arm64-6x` runner can't be restored on `warp-ubuntu-latest-x64-4x` as cache `Version`s are different.

> Pro tip: The [list caches](https://docs.github.com/en/rest/actions/cache#list-github-actions-caches-for-a-repository) API can be used to get the version of a cache. This can be helpful to troubleshoot cache miss due to version.

<details>
  <summary>Example</summary>
The workflow will create 3 unique caches with same keys. Ubuntu and mac runners will use different compression technique and hence create two different caches. And `build-linux` will create two different caches as the `paths` are different.

```yaml
jobs:
  build-linux:
    runs-on: warp-ubuntu-latest-x64-4x
    steps:
      - uses: actions/checkout@v3

      - name: Cache Primes
        id: cache-primes
        uses: WarpBuilds/cache@v1
        with:
          path: prime-numbers
          key: primes

      - name: Generate Prime Numbers
        if: steps.cache-primes.outputs.cache-hit != 'true'
        run: ./generate-primes.sh -d prime-numbers

      - name: Cache Numbers
        id: cache-numbers
        uses: WarpBuilds/cache@v1
        with:
          path: numbers
          key: primes

      - name: Generate Numbers
        if: steps.cache-numbers.outputs.cache-hit != 'true'
        run: ./generate-primes.sh -d numbers

  build-mac:
    runs-on: warp-macos-14-arm64-6x
    steps:
      - uses: actions/checkout@v3

      - name: Cache Primes
        id: cache-primes
        uses: WarpBuilds/cache@v1
        with:
          path: prime-numbers
          key: primes

      - name: Generate Prime Numbers
        if: steps.cache-primes.outputs.cache-hit != 'true'
        run: ./generate-primes -d prime-numbers
```

</details>

## Running inside a container

To use WarpCache inside a container, you need to pass the `WARPBUILD_RUNNER_VERIFICATION_TOKEN` environment variable to the container as shown below. This env var is always present in WarpBuild runners and is used to authenticate the action with the WarpBuild service.

```yaml
test-proxy-save:
  runs-on: warp-ubuntu-latest-x64-16x
    container:
      image: ubuntu:latest
      env:
        WARPBUILD_RUNNER_VERIFICATION_TOKEN: ${{ env.WARPBUILD_RUNNER_VERIFICATION_TOKEN }}
```

## Known practices and workarounds

There are a number of community practices/workarounds to fulfill specific requirements. You may choose to use them if they suit your use case. Note these are not necessarily the only solution or even a recommended solution.

* [Cache segment restore timeout](./tips-and-workarounds.md#cache-segment-restore-timeout)
* [Update a cache](./tips-and-workarounds.md#update-a-cache)
* [Use cache across feature branches](./tips-and-workarounds.md#use-cache-across-feature-branches)
* [Cross OS cache](./tips-and-workarounds.md#cross-os-cache)
* [Cross Arch cache](./tips-and-workarounds.md#cross-arch-cache)
* [Deletion of Caches](./tips-and-workarounds.md#deletion-of-caches)

### Windows environment variables

Please note that Windows environment variables (like `%LocalAppData%`) will NOT be expanded by this action. Instead, prefer using `~` in your paths which will expand to the HOME directory. For example, instead of `%LocalAppData%`, use `~\AppData\Local`. For a list of supported default environment variables, see the [Learn GitHub Actions: Variables](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables) page.

## Contributing

We would love for you to contribute to `actions/cache`. Pull requests are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

## Attribution

A big thank you to the GitHub team for their amazing work on the [actions/cache](https://github.com/actions/cache).

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
