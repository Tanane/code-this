require('code-this-commons/polyfills/string')
const { utils: { call } } = require('code-this-commons')
const context = require('./context')

module.exports = function (id) {

    return call('GET', `${this.API_URL}/users/${id ? id : ''}`,
        undefined,
        { 'Authorization': `Bearer ${sessionStorage.token}` })
        .then(({ status, body }) => {
            if (status === 200) {
                return JSON.parse(body)
            } else {
                const { error } = JSON.parse(body)

                throw new Error(error)
            }
        })
}.bind(context)