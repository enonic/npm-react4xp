require('./bold.scss');
require('./italic.styl');
require('./red.sass');
require('./underline.css');

exports.default = function() {
	return <h1 className="bold italic red underline">Red</h1>
}
