## Promise bonanzer

Hey there! After a tech test in which i was told Promise.allSettled wasn't good enough I had to sit down and really think about what else is out there.... Like i loved promise.allSettled why wasn't it good enough! 

The problem was... 

- We had to run a lot of promises
- We may be continually adding promises
- We can not run all at once
    - a. because of rate limiting (i had suggested exponential back of with jitter but also wasn't good enough)
    - b. Obviously our machine or any machine can only do a certain amount at once - but how do we find out that limit?

### Breaking it down

We needn't worry about the amount of promises per se, however it indicates to us that error handling and continuing despite errors will be important. Therefor out of our native available promise handling methods the promise.allSettled option is the preferred as we don't want to stop running our code if there is a problem.

However promise.allsettled does not enable us to run these promises concurrently - it will launch them all at once, this could trigger rate limiting from upstream servers therefore we'd like a better control over how much traffic we are sending to those upstream service.

Also promise.allsettled means we need to generate all our promise requests beforehand then run them, making it hard to continually push requests to it. 

### part one - concurrency

The concurrent promise runner, will run a given amount of promise functions concurrently. This resolves the later part of our problem. We have a way we can control how many promises we are running at one time, this should enable us to avoid issues around rate limiting from upstream servers as well as avoid running to much work on our system at once.

### part two a - how many io connections can our machine even have?

Lets be clear promises aren't inherently network operations, however in our context we are using them for data fetching with fetch so they will be running network operations. I will come back to this one because its super interesting but requires a deep dive into browsers.

### part two b - how can we safely add as we go?

How can we safely add promises to our throttle as we go? how can that return the data correctly and work with in a code base.
