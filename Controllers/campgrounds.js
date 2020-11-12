const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    // console.log('After login', req.session, req.isAuthenticated());
    res.render('campground/index', {campgrounds});
}

module.exports.renderNewForm = (req, res) => {
    // console.log('Inside new',req.session, req.isAuthenticated())
    // console.log(req.isUnauthenticated(), 'hello')
    res.render('campground/new');
}

module.exports.createCampground = async (req, res) => {
    // if (!req.body.campground) throw new expressError('Invalid Campground Data', 400);
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry= geoData.body.features[0].geometry;

    // console.log("Here is the request..",req);
    // console.log("Here is the request.user..",req.user);
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    //console.log('I am in id');
    let {id} = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error', 'Cannot find that campground!');   
        return res.redirect('/campgrounds')
    }
    res.render('campground/show', {campground});
}

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render('campground/edit', {campground});
}

module.exports.updateCampground = async (req, res) => {
    let {id} = req.params;
    console.log('Updated Campground: ', req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.images.push(...imgs)
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
        console.log(campground);
    }
    req.flash('success', 'Successfully updated the campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    let {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground!');
    res.redirect(`/campgrounds`);
}