const hapi = require('hapi')
const mongoose = require('mongoose')
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi')
const schema = require('./graphql/schema')
const Painting = require('./models/Painting')

/* swagger section */
const Inert = require('inert')
const Vision = require('vision')
const HapiSwagger = require('hapi-swagger')
const Pack = require('./package')

const server = hapi.server({
    port: 4000,
    host: 'localhost'
})

mongoose.connect('mongodb://localhost/hapi_v1')
mongoose.connection.once('open', () => {
    console.log('connected to database')
})

const init = async () => {
    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: {
                info: {
                    title: 'Painting API Documentation',
                    version: Pack.version
                }
            }
        }
    ])
    await server.register({
		plugin: graphiqlHapi,
		options: {
			path: '/graphiql',
			graphiqlOptions: {
				endpointURL: '/graphql'
			},
			route: {
				cors: true
			}
		}
	});
	await server.register({
		plugin: graphqlHapi,
		options: {
			path: '/graphql',
			graphqlOptions: {
				schema
			},
			route: {
				cors: true
			}
		}
	});
    server.route([
        {
            method: 'GET',
            path: '/',
            handler: (request, reply) => {
                return `<h1>My modern api</h1>`
            }
        },
        {
            method: 'GET',
            path: '/api/v1/paintings',
            config: {
                description: 'Get all the paintings',
                tags: ['api', 'v1', 'paintings']
            },
            handler: (req, reply) => {
                return Painting.find()
            }
        },
        {
            method: 'POST',
            path: '/api/v1/paintings',
            config: {
                description: 'Post a painting',
                tags: ['api', 'v1', 'painting']
            },
            handler: (req, reply) => {
                const { name, url, techniques } = req.payload
                const painting = new Painting({
                    name,
                    url,
                    techniques
                })
                return painting.save()
            }
        }
    ])
    await server.start()
    console.log(`Server running at: ${server.info.uri}`)
}

init()