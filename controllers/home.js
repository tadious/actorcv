/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('landing/home', {
    title: 'Home'
  });
};

exports.home = (req, res) => {
	res.render('home', {
		title: 'Home'
	});
};

exports.whyUs = (req, res) => {
	res.render('landing/why-actor-cv', {
		title: 'Why ActorCV'
	});
};

exports.pricing = (req, res) => {
	res.render('landing/pricing', {
		title: 'Pricing'
	});
};

exports.about = (req, res) => {
	res.render('landing/about', {
		title: 'About'
	});
};

exports.welcome = (req, res) => {
	res.render('landing/welcome', {
		title: 'Welcome'
	});
};
