#!/bin/sh -l

echo "::debug:: Debug Message"
echo "::error:: Error Messag"
echo "::warning:: Warning Message"

echo "::add-mask::$1"

echo "Hello $1"

time=$(date)

echo "::set-output name=time::$time"

echo "::group::Some expandable logs"
echo "hello there"
echo "::endgroup::"

echo "::set-env name=HELLO::helo"