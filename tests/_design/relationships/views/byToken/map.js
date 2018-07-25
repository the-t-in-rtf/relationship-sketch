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
