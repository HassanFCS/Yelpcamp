const mongoose = require('mongoose');
const Campground = require('../models/campground');
const {places, descriptors} = require('./seedHelper');
const cities = require('./seeds');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("DB is connected.");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async ()=>{
    await Campground.deleteMany({});

    for(let i=0; i<30; i++){
        const random30 = Math.floor(Math.random() * 30);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '5fa3d1e805790d128387fc6d',
            location: `${cities[random30].city}, ${cities[random30].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Unde, earum! Quisquam, omnis suscipit reprehenderit nisi rem incidunt quas ad beatae voluptatum dolorem? Porro eveniet autem perferendis esse amet fugit obcaecati.',
            price: price,
            geometry: {
                type: 'Point',
                coordinates: [
                  cities[random30].longitude,
                  cities[random30].latitude
                ] 
            },

            images: [
                {
                  url: 'https://res.cloudinary.com/cloudinaryfcs/image/upload/v1605020210/YelpCamp/ll2iyzmc5j2wiafdceen.jpg',
                  filename: 'YelpCamp/ll2iyzmc5j2wiafdceen'
                },
                {
                  url: 'https://res.cloudinary.com/cloudinaryfcs/image/upload/v1605020210/YelpCamp/jnnyec2lugd7redwzkvr.jpg',
                  filename: 'YelpCamp/jnnyec2lugd7redwzkvr'
                },
                {
                  url: 'https://res.cloudinary.com/cloudinaryfcs/image/upload/v1605020210/YelpCamp/y99u9qdvqnfvabixpk5h.jpg',
                  filename: 'YelpCamp/y99u9qdvqnfvabixpk5h'
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
    console.log('DB Disconnected');
});