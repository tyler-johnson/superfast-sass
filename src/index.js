import path from "path";
import sass from "node-sass";
import assign from "lodash/assign";
var thispkg = require("./package.json");

export default function(compile) {
	let p = [];

	// move this library to devDependency
	let meta = compile.metadata;
	if (meta.dependencies[thispkg.name]) {
		let ver = meta.dependencies[thispkg.name];
		meta.remove(thispkg.name);
		p.push(meta.add(thispkg.name + "@" + ver, { dev: true }));
	}

	compile.transform.use(transform(compile.options.sass));

	return Promise.all(p);
}

function transform(options) {
	return function(file) {
		if (path.extname(file.path) !== ".scss") return;
		file.type = "style";
		file.targets = ["client"];
		file.originalSource = file.source;

		return new Promise((resolve, reject) => {
			let opts = assign({}, options);
			opts.data = file.originalSource;
			opts.includePaths = [].concat(opts.includePaths, path.dirname(file.fullpath)).filter(Boolean);

			sass.render(opts, (err, res) => {
				if (err) return reject(err);
				file.source = res.css.toString();
				resolve();
			});
		});
	};
}
