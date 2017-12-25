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

exports.demo = (req, res) => {
	res.render('landing/demo', {
		title: 'Demo'
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
