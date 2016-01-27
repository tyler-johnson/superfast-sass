import path from "path";
import sass from "node-sass";
// import assign from "lodash/assign";
import resolve from "resolve";

export default function(compile) {
	compile.transform(transform);
}

function transform(file, src) {
	if (path.extname(file.path) !== ".scss") return;
	file.setType("style");
	file.target("client");

	return new Promise((resolve, reject) => {
		sass.render({
			data: src,
			includePaths: [ path.dirname(file.fullpath) ],
			importer: moduleImporter
		}, (err, res) => {
			if (err) return reject(err);
			resolve(res.css.toString());
		});
	});
}

function moduleImporter(file, prev, done) {
	if (file[0] !== "~") return done({ file: file });

	resolve(file.substr(1), {
		basedir: path.dirname(prev),
		extensions: [ ".scss" ],
		packageFilter: function(pkg) {
			if (pkg.sass) {
				pkg.oldMain = pkg.main;
				pkg.main = pkg.sass;
			} else if (pkg.style) {
				pkg.oldMain = pkg.main;
				pkg.main = pkg.style;
			}

			return pkg;
		}
	}, function(err, res) {
		if (err) return done(err);
		done({ file: res });
	});
}
