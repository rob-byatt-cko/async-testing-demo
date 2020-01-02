#!/bin/bash
awslocal kinesis create-stream --stream-name demo-stream-write --shard-count 1
awslocal kinesis create-stream --stream-name demo-stream-read --shard-count 1