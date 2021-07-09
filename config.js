const database_url = process.env.DATABASE || "mongodb+srv://sadil:sadil123@cluster0-x1l7a.mongodb.net/test?retryWrites=true&w=majority";

module.exports = {
    "database": database_url
};