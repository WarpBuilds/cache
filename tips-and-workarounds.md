# Tips and workarounds

## Cache segment restore timeout

WarpCache has a segment download timeout similarly to GitHub. The segment download timeout will allow the segment download to get aborted and hence allow the job to proceed with a cache miss.

Default value of this timeout is 10 minutes and can be customized by specifying an [environment variable](https://docs.github.com/en/actions/learn-github-actions/environment-variables) named `SEGMENT_DOWNLOAD_TIMEOUT_MINS` with timeout value in minutes.

## Update a cache

A cache today is immutable and cannot be updated. But some use cases require the cache to be saved even though there was a "hit" during restore. To do so, use a `key` which is unique for every run and use `restore-keys` to restore the nearest cache. For example:

  ```yaml
      - name: update cache on every commit
        uses: WarpBuilds/cache@v1
        with:
          path: prime-numbers
          key: primes-${{ runner.os }}-${{ github.run_id }} # Can use time based key as well
          restore-keys: |
            primes-${{ runner.os }}
  ```

  Please note that this will create a new cache on every run and hence will consume the cache [quota](./README.md#cache-limits).

## Use cache across feature branches

Reusing cache across feature branches is not allowed today to provide cache isolation. However if both feature branches are from the default branch, a good way to achieve this is to ensure that the default branch has a cache. This cache will then be consumable by both feature branches.

Matching cache keys for restores follows the same rules as GitHub Actions Cache which are documented [here](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows#restrictions-for-accessing-a-cache).

## Cross OS cache

WarpCache is cross-os compatible when `enableCrossOsArchive` input is passed as true. This means that a cache created on `warp-ubuntu-latest-x64-4x` can be used by `warp-macos-14-arm64-6x` and vice versa, provided the workflow which runs on `warp-macos-14-arm64-6x` have input `enableCrossOsArchive` as true. This is useful to cache dependencies which are independent of the runner platform. This will help reduce the consumption of the cache quota and help build for multiple platforms from the same cache. Things to keep in mind while using this feature:

- Only cache files that are compatible across OSs.
- Caching symlinks might cause issues while restoring them as they behave differently on different OSs.
- Be mindful when caching files from outside your github workspace directory as the directory is located at different places across OS.
- Avoid using directory pointers such as `${{ github.workspace }}` or `~` (home) which eventually evaluate to an absolute path that does not match across OSs.

## Cross Arch cache

Similar to the cross-os cache feature, WarpCache also supports cross-architecture cache using the `enableCrossArchArchive` input. This means that a cache created on `warp-ubuntu-latest-x64-4x` can be used by `warp-ubuntu-latest-arm64-4x` and vice versa, provided the workflow which runs on `warp-ubuntu-latest-arm64-4x` have input `enableCrossArchArchive` as true.

## Deletion of caches

WarpCache provides an input `delete-cache` which can be used to delete the cache from the action. This is useful when the cache is no longer required and can be deleted to free up the cache quota. If delete-cache:true is specified in the workflow, the action will not attempt to restore or save the cache entry. It will always succeed even if the cache does not exist. The cache is only deleted if the key input match. Restore keys will not be considered for deletion. For example:

  ```yaml
      - name: delete cache
        uses: WarpBuilds/cache@v1
        with:
          path: prime-numbers
          key: primes-${{ runner.os }}-${{ github.run_id }}
          delete-cache: true
  ```

