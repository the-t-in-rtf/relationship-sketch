function (doc) {
    if (doc.type === "association") {
        if (doc.user) {
            emit([doc.user, 0], { "_id": doc.user });
            if (doc.safe) {
                emit([doc.user, 1], { "_id": doc.safe });
            }
            if (doc.token) {
                emit([doc.user, 2], { "_id": doc.token });
            }
        }
    }
}
