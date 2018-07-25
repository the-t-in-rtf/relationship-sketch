# CouchDB Relationship Sketch

This is a one-off project to help inform the discussions around how to map users and tokens to their associated
preference safes. The approach outlined here is adapted from one of the earliest examples in the [CouchDB documentation
on approaches to "joining" information from multiple records](http://docs.couchdb.org/en/2.0.0/api/ddoc/views.html).

The essence of the approach is to store the `_id` values for related records in a document that describes the
relationship between the records.  A specialised view can then be used to present the records in such a way that the
full contents of the separate records can be retrieved in a single request.

## Detailed Example: Associating three related records with each other and then looking them up.

Let's say that we have a preference safe, something like the following:

```json
{
    "_id": "safe2",
    "type": "safe",
    "payload": "set to something else."
}
```

Let's say we want to associate this with both a user and a token:

```json
{
    "_id": "user2",
    "type": "user",
    "username": "user2",
    "email": "user2@raisingthefloor.org"
}
```

```json
{
    "_id": "token2",
    "type": "token",
    "value": "anything you want to store in the token (this one belongs to user 2)."
}
```

The "relationship document" that relates these to each other might look like:

```json
{
    "_id": "association2",
    "type": "association",
    "safe": "safe2",
    "user": "user2",
    "token": "token2"
}
```

We then need a function like the following to emit records with the appropriate `_id` values, as in:

```javascript
function (doc) {
    if (doc.type === "association") {
        if (doc.token) {
            emit([doc.token, 0], { "_id": doc.token });
            if (doc.user) {
                emit([doc.token, 1], { "_id": doc.user });
            }
            if (doc.safe) {
                emit([doc.token, 2], { "_id": doc.safe });
            }
        }
    }
}
```

The resulting view presents an array of entries keyed by the token ID.  Entry zero is the token.  If it exists, entry
one is the user.  If it exists, entry 2 is the safe.  Because we know in this case that there can only be a maximum of
three entries per relationship, we can search using the token as the starting point, and using the last possible entry
(the safe) as the end point.

`http://localhost:6789/sample/_design/relationships/_view/byToken?include_docs=true&startkey=["token2",0]&endkey=["token2",2]`

With the `include_docs` parameter set to `true`, CouchDB (or in our case, PouchDB and middleware configured to emulate
CouchDB) will deliver the actual documents referenced by the `_id` values, as in:

```json
[
	{
		"total_rows": 5,
		"offset": 0,
		"rows": [
			{
				"key": [
					"token2",
					0
				],
				"id": "association2",
				"value": {
					"_id": "token2"
				},
				"doc": {
					"value": "anything you want to store in the token (this one belongs to user 2).",
					"_id": "token2",
					"_rev": "1-0cdeb2811fc54291a681b571be84f7a3"
				}
			},
			{
				"key": [
					"token2",
					1
				],
				"id": "association2",
				"value": {
					"_id": "user2"
				},
				"doc": {
					"type": "user",
					"username": "user2",
					"email": "user2@raisingthefloor.org",
					"_id": "user2",
					"_rev": "1-e8aded85ab8244ca8ababd7eaa7a7d0d"
				}
			},
			{
				"key": [
					"token2",
					2
				],
				"id": "association2",
				"value": {
					"_id": "safe2"
				},
				"doc": {
					"type": "safe",
					"payload": "set to something else.",
					"_id": "safe2",
					"_rev": "1-880039aa4b2f4e80a7fff175a3a2a042"
				}
			}
		]
	}
]
```

We would presumably knit together the results after retrieval, as shown in this trivial example:

```json
{
    "token": {
        "type": "token",
        "value": "anything you want to store in the token (this one belongs to user 2).",
        "_id": "token2",
        "_rev": "1-0cdeb2811fc54291a681b571be84f7a3"
    },
    "user": {
        "type": "user",
        "username": "user2",
        "email": "user2@raisingthefloor.org",
        "_id": "user2",
        "_rev": "1-e8aded85ab8244ca8ababd7eaa7a7d0d"
    },
    "safe": {
        "type": "safe",
        "payload": "set to something else.",
        "_id": "safe2",
        "_rev": "1-880039aa4b2f4e80a7fff175a3a2a042"
    }
}
```

## Summary

Although there are other approaches, this seems to fit our use case best in that we have multiple one-to-one
relationships and not many-to-many, one-to-many, or many-to-one relationships.  This approach also gives us the cleanest
options for managing the relationship itself independently of the related records.  Rather than having to understand and
preserve any information in the related records, we are only dealing with the fact that they are related.

For this approach to work:

1. All records including the "relationship document" must live in the same database, which fits our current approach.
2. We must make use of the actual couch `_id` values in the relationship document, and not any other values.

## Live Test Harness

The examples described above (and a few other pieces of sample data) can be run from this project and tested in real
time.  To run the demo:

1. Install this package's dependencies using `npm install`.
2. Run `node src/js/harness.js`.

A sample instance of the [gpii-pouchdb](https://github.com/GPII/gpii-pouchdb) CouchDB-like test harness will be
launched and available on port 6789.  The demo provides three views that can be used to look up records involved in the
relationship:

1. By token
2. By username
3. By safe ID

See above for a detailed example of looking up all records in the relationship by the token ID.  See below for sample
URLS for each of the other types of lookup demonstrated.

### Sample Lookup by username

`http://localhost:6789/sample/_design/relationships/_view/byUser?include_docs=true&startkey=["user1",0]&endkey=["user1",2]`

### Sample Lookup by safe ID

`http://localhost:6789/sample/_design/relationships/_view/bySafe?include_docs=true&startkey=["safe3",0]&endkey=["safe3",2]`
