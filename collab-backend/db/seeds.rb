john = User.create(username: "John", admin: false)
mary = User.create(username: "Mary", admin: false)
samuel = User.create(username: "Samuel", admin: true)

Seed.create(name: "Empty", matrix:"0000000000000000", user_id: john.id)
Seed.create(name: "Full", matrix:"1111111111111111", user_id: mary.id)
Seed.create(name: "Half", matrix:"0101010101010101", user_id: samuel.id)