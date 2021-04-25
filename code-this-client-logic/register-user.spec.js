require('dotenv').config()

const { env: { TEST_MONGODB_URL: MONGODB_URL, TEST_API_URL: API_URL } } = process

const registerUser = require('./register-user')
const { random } = Math
const { expect } = require('chai')
const context = require('./context')
require('code-this-commons/polyfills/json')
const { mongo } = require('../code-this-data')
const bcrypt = require('bcryptjs')
const { models: { User } } = require('code-this-data')

context.API_URL = API_URL

describe.only('logic - register user', () => {
    before(() => mongo.connect(MONGODB_URL))

    let name, email, password

    beforeEach(() =>
        User.deleteMany()
            .then(() => {
                name = `name-${random()}`
                email = `e-${random()}@mail.com`
                password = `password-${random()}`
            })
    )

    it('should succeed on valid data', () =>
        registerUser(name, email, password)
            .then(() => User.find())
            .then(users => {
                expect(users.length).to.equal(1)

                const [user] = users

                expect(user.name).to.equal(name)
                expect(user.email).to.equal(email)

                return bcrypt.compare(password, user.password)
            })
            .then(match => expect(match).to.be.true)
    )

    describe('when user already exists', () => {
        beforeEach(() => User.create({ name, email, password }))

        it('should fail on trying to register an existing user', () =>
            registerUser(name, email, password)
                .then(() => { throw new Error('should not reach this point') })
                .catch(error => {
                    expect(error).to.exist

                    expect(error).to.be.an.instanceof(Error)
                    expect(error.message).to.equal(`user with e-mail ${email} already exists`)
                })
        )
    })

    // afterEach(() => User.deleteMany())

    after(mongo.disconnect)
})