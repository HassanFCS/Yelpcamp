const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async(req, res) => {
    // console.log('eloo');
    const campground = await Campground.findById(req.params.id);
    // console.log(campground)
    const review = new Review(req.body.review);
    review.author = req.user._id;
    // console.log(review)
    campground.reviews.push(review);
    // console.log('Save krny laga');
    await review.save();
    await campground.save();
    // console.log("Save hogya, ab Mein Redirect hony laga");
    req.flash('success', 'Successfully created a Review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async(req,res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the Review!');
    res.redirect(`/campgrounds/${id}`);
}