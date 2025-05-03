/**
 * Ok at this point while we've made something that works, we have also learnt that actually
 * browsers such as chrome already limit the number fo TCP connections our code can have in the first place
 * in the case of chrome this is a 6 connections only meaning our lil consurrency bub isnt really
 * getting to fly and the native promise handlers are good enough.
 *
 * This means to make this useful we move towards node....
 *
 * Therefore we are gonna have some fun modularising this code and making it neater to work with
 * so others can use it, well so i can use it, and it gives me a chance to publish something on npm which i have always wanted to do!
 *
 * To be clear p-limit is essentially what we are doing making us a lil redundent
 *
 */

/**
 *
 *
 * Alright lets think about API
 *
 * As a developer i would like to pass it a bunch of URLS to get
 * on error it should do something
 *
 * I think it would be cool to make it out of the box handle pagination
 *
 * we still like want to give it concurrency limits
 *
 * I may want onError, onSuccess, onBefore etc type handlers for each promise
 *
 * ok so this is really only useful for batch requests and continual data fetching....
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

const promiseHandler = (
    { startingPromises, concurrency } = { startingPromises: [], concurrency: 3 }
) => {
    let currentConcurrency = concurrency || 3

    /** Resolver logic to still enable that eventual resolve behaviour */
    let resolver
    const __ = new Promise((res, _) => {
        resolver = res
    })

    const result = { data: [], errors: [] }
    let pending = 0

    const runPromise = (cb) => {
        pending++
        cb()
            .then((res) => {
                result.data.push(res)
            })
            .catch((err) => {
                result.errors.push(err)
            })
            .finally(() => {
                pending--
                // chain  another promise if there are more to run
                if (pendingPromises.length) {
                    let next = pendingPromises.shift()
                    runPromise(next)
                } else if (pending) {
                    // do nothing
                } else {
                    resolver(result)
                }
            })
    }

    const pendingPromises = [...(startingPromises ? startingPromises : [])]

    const bootRunner = () => {
        while (pending < currentConcurrency && pendingPromises.length > 0) {
            const next = pendingPromises.shift()
            runPromise(next)
        }
    }

    bootRunner() // boots it self up on first load

    const fetchUrl = (url) => {
        pendingPromises.push(fetch(url))
        bootRunner()
        return __
    }

    const fetchUrls = (stringUrlsArray) => {
        const promises = stringUrlsArray.map((url) => {
            return () => fetch(url)
        })
        pendingPromises.push(...promises)
        bootRunner()
        return __
    }

    return { fetchUrl, fetchUrls }
}

// ok great the ui is now even more friendly we can do the following

// ;(async () => {
//     const { fetchUrls } = promiseHandler()
//     const { data, error } = await fetchUrls([
//         'https://pokeapi.co/api/v2/pokemon/ditto',
//         'https://pokeapi.co/api/v2/pokemon/squirtle',
//         'https://pokeapi.co/api/v2/pokemon/ponyta',
//         'https://pokeapi.co/api/v2/pokemon/golduck',
//         'https://pokeapi.co/api/v2/pokemon/vulpix',
//         'https://pokeapi.co/api/v2/pokemon/charizard',
//         'https://pokeapi.co/api/v2/pokemon/rattata',
//         'https://pokeapi.co/api/v2/pokemon/pidgey',
//         'https://pokeapi.co/api/v2/pokemon/charmander',
//         'https://pokeapi.co/api/v2/pokemon/venusaur',
//     ])

//     console.log({ data })
// })()

// nice this is simple to work with but i get so much results!! now lets add a onPreFetch, onSuccess and onFailure

const promiseHandlerV2 = (
    { startingPromises, concurrency } = { startingPromises: [], concurrency: 3 }
) => {
    let currentConcurrency = concurrency || 3

    /** Resolver logic to still enable that eventual resolve behaviour */
    let resolver
    const __ = new Promise((res, _) => {
        resolver = res
    })

    const result = { data: [], errors: [] }
    let pending = 0

    const runPromise = (cb) => {
        pending++
        cb().finally(() => {
            pending--
            // chain  another promise if there are more to run
            if (pendingPromises.length) {
                let next = pendingPromises.shift()
                runPromise(next)
            } else if (pending) {
                // do nothing
            } else {
                resolver(result)
            }
        })
    }

    const pendingPromises = [...(startingPromises ? startingPromises : [])]

    const bootRunner = () => {
        while (pending < currentConcurrency && pendingPromises.length > 0) {
            const next = pendingPromises.shift()
            runPromise(next)
        }
    }

    bootRunner() // boots it self up on first load

    const fetchUrl = (url) => {
        pendingPromises.push(fetch(url))
        bootRunner()
        return __
    }

    const fetchUrls = (
        stringUrlsArray,
        { onPrefetch, onFailure, onSuccess }
    ) => {
        const promises = stringUrlsArray.map((url) => {
            let ourFunction = () => {
                if (onPrefetch) {
                    onPrefetch()
                }
                return fetch(url)
                    .then((res) => {
                        return res.json()
                    })
                    .then((res) => {
                        onSuccess?.(res)
                        result.data.push(res)
                        return res
                    })
                    .catch((err) => {
                        onFailure?.(err)
                        result.errors.push(err)
                    })
            }

            return ourFunction
        })
        pendingPromises.push(...promises)
        bootRunner()
        return __
    }

    return { fetchUrl, fetchUrls }
}

// ok great the ui is now even more friendly we can do the following

;(async () => {
    const { fetchUrls } = promiseHandlerV2()
    const { data, error } = await fetchUrls(
        [
            'https://pokeapi.co/api/v2/pokemon/ditto',
            'https://pokeapi.co/api/v2/pokemon/squirtle',
            'https://pokeapi.co/api/v2/pokemon/ponyta',
            'https://pokeapi.co/api/v2/pokemon/golduck',
            'https://pokeapi.co/api/v2/pokemon/vulpix',
            'https://pokeapi.co/api/v2/pokemon/charizard',
            'https://pokeapi.co/api/v2/pokemon/rattata',
            'https://pokeapi.co/api/v2/pokemon/pidgey',
            'https://pokeapi.co/api/v2/pokemon/charmander',
            'https://pokeapi.co/api/v2/pokemon/venusaur',
        ],
        {
            onPrefetch: () => {
                console.log('im fetching')
            },
            onSuccess: () => {
                console.log('i found it')
            },
            onError: () => {
                console.log('oops')
            },
        }
    )

    console.log({ data })
})()

/**
 * Alright super nice and easy fetchy fetchy
 */
