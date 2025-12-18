const express = require('express')
const cors = require('cors')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const app = express()
app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, "database", "notebit.db")

let db = null

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })

        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                email TEXT UNIQUE,
                password TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );  
        `)

        await db.exec(`
            CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            is_pinned BOOLEAN DEFAULT 0,
            background_color VARCHAR(20) DEFAULT '#ffffff',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `)

        await db.exec(`
            CREATE TABLE IF NOT EXISTS password_resets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE 
            )    
        `)

        app.listen(5000, () => {
            console.log("Server running at http://localhost:5000/")
        })
    } catch (e) {
        console.log(`DB Error: ${e.message}`)
        process.exit(1)
    }
}

initializeDBAndServer()

const validateEmailFormat = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// sign-up api
app.post("/sign-up", async (request, response) => {
    const {username, email, password} = request.body

    // trimming extra white space 
    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    // checking for empty field
    if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
        response.status(400)
        response.send({error: "All fields are required"})
        return
    }

    // checking for valid password length
    if (trimmedPassword.length < 8) {
        response.status(400)
        response.send({error: "Password must be at least 8 characters long"})
        return 
    }

    // checking for correct email format 
    if (!validateEmailFormat(trimmedEmail)) {
        response.status(400)
        response.send({error: "Invalid email format"})
        return 
    }

    // fetching user by email
    const getUserByEmail = `
        SELECT
            *
        FROM
            users
        WHERE
            email = '${trimmedEmail}';
    `

    // check if email already used or not
    const isEmailALreadyUsed = await db.get(getUserByEmail)

    if (isEmailALreadyUsed) {
        response.status(409)
        response.send({error: "Email already registered"})
        return 
    }

    // fetching user by username
    const getUserByUsername = `
        SELECT
            *
        FROM
            users
        WHERE
            username = '${trimmedUsername}';
    `

    // check if username is already taken or not
    const isUsernameAlreadyTaken = await db.get(getUserByUsername)

    if (isUsernameAlreadyTaken) {
        response.status(409)
        response.send({error: "Username already taken"})
        return 
    }

    // converting password to hashed password
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10)

    // create user query
    const createUserQuery = `
        INSERT INTO users 
            (username, email, password)
        VALUES  (
            '${trimmedUsername}',
            '${trimmedEmail}',
            '${hashedPassword}'
        );
    `

    // creating new user in users table
    await db.run(createUserQuery)

    response.status(200)
    response.send({message: "Boom! Your account is ready. Now, sign in and let's go!"})
})

// sign-in api
app.post("/sign-in", async (request, response) => {
    const {email, password} = request.body

    // trimming extra white space 
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    // checking for empty field
    if (!trimmedEmail || !trimmedPassword) {
        response.status(400)
        response.send({error: "All fields are required"})
        return
    }

    // checking for correct email format 
    if (!validateEmailFormat(trimmedEmail)) {
        response.status(400)
        response.send({error: "Invalid email format"})
        return
    }

    // get user query
    const getUserQuery = `
        SELECT
            *
        FROM
            users
        WHERE
            email = '${trimmedEmail}';
    `

    // fetching user data from database
    const dbUser = await db.get(getUserQuery)


    if (!dbUser) {
        response.status(400)
        response.send({error: "Invalid email or password"})
        return
    } else {
        // comparing user entered password with password stored in database 
         const isPasswordMatched = await bcrypt.compare(trimmedPassword, dbUser.password)
         if (isPasswordMatched) { // if user enterd password matched with password stored in database 
            // payload for jwt token
            const payload = {
                email: trimmedEmail,
            }
            // creating jwt token 
            const jwt_token = jwt.sign(payload, "MY_SECRET_TOKEN")
            response.send({jwt_token})
         } else { // if password didn't match
            response.status(400)
            response.send({error: "Invalid email or password"})
         }
    }
})

// Authenticate Request
const authenticateToken = (request, response, next) => {
    let jwtToken
    const authHeader = request.headers["authorization"]
    if (authHeader) {
        jwtToken = authHeader.split(" ")[1]
    }
    if (!jwtToken) {
        response.status(401)
        response.send({error: "Invalid Request"})
    } else {
        jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
            if (error) {
                response.status(401)
                response.send({error: "Invalid Request"})
            } else {
                const {email} = payload
                request.email = email
                next()
            }
        })
    }
}

// Create a new note for the logged-in user only
app.post("/notes", authenticateToken, async (request, response) => {
    const {email} = request
    const {title, content = "", isPinned = 0, backgroundColor = "white"} = request.body

    if (!title || !title.trim()) {
        response.status(400)
        response.send({error: "Title is required"})
        return
    }

    const getUserQuery = `
        SELECT
            id
        FROM
            users
        WHERE
            email = ?;
    `

    const user = await db.get(getUserQuery, [email])

    if (!user) {
        response.status(404)
        response.send({error: "user not found"})
        return
    }

    const createNoteQuery = `
        INSERT INTO notes
            (user_id, title, content, is_pinned, background_color)
        VALUES
            (?, ?, ?, ?, ?);
    `

    const result = await db.run(createNoteQuery, [user.id, title.trim(), content, isPinned, backgroundColor])

    response.status(201)
    response.send({message: "Note created successfully"})
})

// Return all notes belonging to the logged-in user
app.get("/notes", authenticateToken, async (request, response) => {
    const {email} = request

    const getUserQuery = `
        SELECT
            id
        FROM
            users
        WHERE   
            email = ?;
    `    
    const user = await db.get(getUserQuery, [email])

    if (!user) {
        response.status(404)
        response.send({error: "User not found"})
        return
    }

    const getNotesQuery = `
        SELECT
            *
        FROM
            notes
        WHERE
            user_id = ?
        ORDER BY id ASC;
    `

    const notesArray = await db.all(getNotesQuery, [user.id])

    response.status(200)
    response.send({notesArray})
})

// Return list of pinned notes
app.get("/notes/pinned", authenticateToken, async (request, response) => {
    const {email} = request

    const getUserQuery = `
        SELECT
            *
        FROM
            users
        WHERE
            email = ?;
    `

    const user = await db.get(getUserQuery, [email])

    if (!user) {
        response.status(400)
        response.send({error: "User not found"})
        return
    }

    const getPinnedNotesQuery = `
        SELECT
            *
        FROM
            notes
        WHERE
            is_pinned = 1 and user_id = ?;
    `

    const pinnedNotesArray = await db.all(getPinnedNotesQuery, [user.id])

    response.send({pinnedNotesArray})
})

// fetch single note
app.get("/notes/:noteId/", authenticateToken, async (request, response) => {
    const {email} = request
    const {noteId} = request.params

    const getUserQuery = `
        SELECT
            id
        FROM
            users
        WHERE
            email = ?;
    `

    const user = await db.get(getUserQuery, [email])

    if (!user) {
        response.status(404)
        response.send({error: "User not found"})
        return
    }

    const getNoteQuery = `
        SELECT
            *
        FROM
            notes
        WHERE
            id = ? and 
            user_id = ?;
    `

    const note = await db.get(getNoteQuery, [noteId, user.id])

    if (!note) {
        response.status(404)
        response.send({error: "Note not found"})
        return
    }

    response.status(200)
    response.send({note})
})

// update note
app.put("/notes/:noteId/", authenticateToken, async (request, response) => {
    const {email} = request
    const {noteId} = request.params
    const {title, content, isPinned, backgroundColor = "white"} = request.body

    const getUserQuery = `
        SELECT
            id
        FROM
            users
        WHERE
            email = ?;
    `

    const user = await db.get(getUserQuery, [email])

    if (!user) {
        response.status(404)
        response.send({error: "User not found"})
        return 
    }

    const getNoteQuery = `
        SELECT 
            *
        FROM
            notes
        WHERE
            id = ? AND user_id = ?;
    `

    const noteData = await db.get(getNoteQuery, [noteId, user.id])

    if (!noteData) {
        response.status(404)
        response.send({error: "Note not found"})
        return
    }

    const updateFields = []
    const updateValues = []

    updateFields.push("background_color = ?")
    updateValues.push(backgroundColor)
    
    if (title !== undefined) {
        if (!title.trim()) {
            response.status(400)
            response.send({error: "Title is required"})
            return
        }
        updateFields.push("title = ?")
        updateValues.push(title.trim())
    }
    if (content !== undefined) {
        updateFields.push("content = ?")
        updateValues.push(content)
    }
    if (isPinned !== undefined) {
        updateFields.push("is_pinned = ?")
        updateValues.push(isPinned ? 1 : 0)
    }

    if (updateFields.length === 0) {
        response.status(400)
        response.send({error: "Nothing to update"})
        return
    }
    updateFields.push("updated_at = CURRENT_TIMESTAMP")

    const updateNoteQuery = `
        UPDATE notes
        SET ${updateFields.join(',')}
        WHERE id = ? AND user_id = ?;
    `

    await db.run(updateNoteQuery, [...updateValues, noteId, user.id])

    response.status(200)
    response.send({message: "Note updated successfully"})
})

// delete note
app.delete("/notes/:noteId/", authenticateToken, async (request, response) => {
    const {email} = request
    const {noteId} = request.params

    const getUserQuery = `
        SELECT
            *
        FROM
            users
        WHERE 
            email = ?;
    `

    const user = await db.get(getUserQuery, [email])

    if (!user) {
        response.status(404)
        response.send({error: "User not found"})
        return
    }

    const getNoteQuery = `
        SELECT
            *
        FROM   
            notes
        WHERE
            id = ? AND user_id = ?;
    `

    const noteData = await db.get(getNoteQuery, [noteId, user.id])
    
    if (!noteData) {
        response.status(404)
        response.send({error: "Note not found"})
        return
    }

    const deleteNoteQuery = `
        DELETE 
        FROM 
            notes
        WHERE
            id = ? AND user_id = ?;
    `

    await db.run(deleteNoteQuery, [noteId, user.id])

    response.status(200)
    response.send({message: "Note deleted successfully"})
})

// Return User Account Details
app.get("/account/summary", authenticateToken, async (request, response) => {
    const {email} = request

    const getUserQuery = `
        SELECT
            *
        FROM
            users
        WHERE
            email = ?;
    `

    const user = await db.get(getUserQuery, [email])

    if (!user) {
        response.status(400)
        response.send({error: "User not found"})
        return
    }

    const getUserAccountSummaryQuery = `
        SELECT
            users.username,
            users.email,
            users.created_at,
            COUNT(notes.id) AS total_notes,
            SUM(CASE WHEN notes.is_pinned = 1 THEN 1 ELSE 0 END) AS pinned_notes
        FROM
            users LEFT JOIN notes ON users.id = notes.user_id
        WHERE
           users.id = ?;
    ` 

    const userDetails = await db.get(getUserAccountSummaryQuery, [user.id])
    response.send({userDetails})
})

// forgot password
app.post("/forgot-password", async (request, response) => {
    const {email} = request.body
    const getUserQuery = `
        SELECT
            *
        FROM
            users
        WHERE
            email = ?;
    `

    const user = await db.get(getUserQuery, [email])

    if (!user) {
        response.send({message: "If the email exists, a reset link has been generated"})
        return
    }

    const token = crypto.randomBytes(32).toString("hex")

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await db.run(
        `INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?);`,
        [user.id, token, expiresAt]
    )

    const passwordResetLink = `http://localhost:3000/reset-password/${token}`

    response.send({message: "If the email exists, a reset link has been generated", passwordResetLink})
})

// reset password
app.post("/reset-password/:token", async (request, response) => {
    const {token} = request.params
    const {password} = request.body

    if (password.length < 8) {
        response.status(400)
        response.send({error: "Password must be at least 8 characters long"})
        return
    }

    const getTokenQuery = `
        SELECT
            *
        FROM
            password_resets
        WHERE
            token = ?;
    `

    const tokenData = await db.get(getTokenQuery, [token])

    console.log(tokenData)

    if (!tokenData) {
        response.status(400)
        response.send({error: "Invalid reset link"})
        return
    }

    const userId = tokenData.user_id
    const expiresAt = tokenData.expires_at

    const currentTime = new Date()
    const expiryTime = new Date(expiresAt)

    if (currentTime > expiryTime) {
        response.status(400)
        response.send({error: "Reset link expired"})
        return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const updatePasswordQuery = `
    UPDATE 
    users
    SET password = ?
    WHERE
    id = ?;
    `
    
    const result = await db.run(updatePasswordQuery, [hashedPassword, userId])
    console.log(result)

    const deleteTokenQuery = `
        DELETE FROM password_resets
        WHERE token = ?;
    `

    db.run(deleteTokenQuery, [token])

    response.send({message: "Password reset successfully"})
})
