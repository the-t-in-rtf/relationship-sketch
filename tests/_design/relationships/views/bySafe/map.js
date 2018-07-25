function (doc) {
    if (doc.type === "association") {
        if (doc.safe) {
            emit([doc.safe, 0], { "_id": doc.safe });
            if (doc.user) {
                emit([doc.safe, 1], { "_id": doc.user });
            }
            if (doc.token) {
                emit([doc.safe, 2], { "_id": doc.token });
            }
        }
    }
}
