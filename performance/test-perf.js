import * as m from "../mithril";
var mBinding = m;
import browserMock from "../test-utils/browserMock";
/* global Benchmark */
"use strict"

// Do this silly dance so browser testing works
var B = typeof Benchmark === "undefined" ? require("benchmark") : Benchmark

// set up browser env on before running tests
var doc = typeof document !== "undefined" ? document : null

if(!doc) {
	var mock = browserMock()
	if (typeof global !== "undefined") { global.window = mock }

	doc = mock.document
}

scratch = doc.createElement("div");

(doc.body || doc.documentElement).appendChild(scratch)

// Initialize benchmark suite
var suite = new B.Suite("mithril perf")

suite.on("start", function() {
	this.start = Date.now();
})

suite.on("cycle", function(e) {
	console.log(e.target.toString())

	scratch.innerHTML = ""
})

suite.on("complete", function() {
	console.log("Completed perf tests in " + (Date.now() - this.start) + "ms")
})

suite.on("error", console.error.bind(console))

suite.add({
	name : "rerender without changes",
	onStart : function() {
		this.vdom = mBinding("div", {class: "foo bar", "data-foo": "bar", p: 2},
			mBinding("header",
				mBinding("h1", {class: "asdf"}, "a ", "b", " c ", 0, " d"),
				mBinding("nav",
					mBinding("a", {href: "/foo"}, "Foo"),
					mBinding("a", {href: "/bar"}, "Bar")
				)
			),
			mBinding("main",
				mBinding("form", {onSubmit: function onSubmit() {}},
					mBinding("input", {type: "checkbox", checked: true}),
					mBinding("input", {type: "checkbox", checked: false}),
					mBinding("fieldset",
						mBinding("label",
							mBinding("input", {type: "radio", checked: true})
						),
						mBinding("label",
							mBinding("input", {type: "radio"})
						)
					),
					mBinding("button-bar",
						mBinding("button",
							{style: "width:10px; height:10px; border:1px solid #FFF;"},
							"Normal CSS"
						),
						mBinding("button",
							{style: "top:0 ; right: 20"},
							"Poor CSS"
						),
						mBinding("button",
							{style: "invalid-prop:1;padding:1px;font:12px/1.1 arial,sans-serif;", icon: true},
							"Poorer CSS"
						),
						mBinding("button",
							{style: {margin: 0, padding: "10px", overflow: "visible"}},
							"Object CSS"
						)
					)
				)
			)
		)
	},
	fn : function() {
		mBinding.render(scratch, this.vdom)
	}
})

suite.add({
	name : "construct large VDOM tree",

	onStart : function() {
		var fields = []

		for(var i=100; i--;) {
			fields.push((i * 999).toString(36))
		}

		this.fields = fields;
	},

	fn : function () {
		mBinding("div", {class: "foo bar", "data-foo": "bar", p: 2},
			mBinding("header",
				mBinding("h1", {class: "asdf"}, "a ", "b", " c ", 0, " d"),
				mBinding("nav",
					mBinding("a", {href: "/foo"}, "Foo"),
					mBinding("a", {href: "/bar"}, "Bar")
				)
			),
			mBinding("main",
				mBinding("form",
					{onSubmit: function onSubmit() {}},
					mBinding("input", {type: "checkbox", checked: true}),
					mBinding("input", {type: "checkbox"}),
					mBinding("fieldset",
						this.fields.map(function (field) {
							return mBinding("label",
								field,
								":",
								mBinding("input", {placeholder: field})
							);
						})
					),
					mBinding("button-bar",
						mBinding("button",
							{style: "width:10px; height:10px; border:1px solid #FFF;"},
							"Normal CSS"
						),
						mBinding("button",
							{style: "top:0 ; right: 20"},
							"Poor CSS"
						),
						mBinding("button",
							{style: "invalid-prop:1;padding:1px;font:12px/1.1 arial,sans-serif;", icon: true},
							"Poorer CSS"
						),
						mBinding("button",
							{style: {margin: 0, padding: "10px", overflow: "visible"}},
							"Object CSS"
						)
					)
				)
			)
		)
	}
})

suite.add({
	name : "mutate styles/properties",

	onStart : function () {
		var counter = 0
		var keyLooper = function (n) { return function (c) { return c % n ? (c + "px") : c } }
		var get = function (obj, i) { return obj[i%obj.length] }
		var classes = ["foo", "foo bar", "", "baz-bat", null, "fooga"]
		var styles = []
		var multivalue = ["0 1px", "0 0 1px 0", "0", "1px", "20px 10px", "7em 5px", "1px 0 5em 2px"]
		var stylekeys = [
			["left", keyLooper(3)],
			["top", keyLooper(2)],
			["margin", function (c) { return get(multivalue, c).replace("1px", c+"px") }],
			["padding", function (c) { return get(multivalue, c) }],
			["position", function (c) { return c%5 ? c%2 ? "absolute" : "relative" : null }],
			["display", function (c) { return c%10 ? c%2 ? "block" : "inline" : "none" }],
			["color", function (c) { return ("rgba(" + (c%255) + ", " + (255 - c%255) + ", " + (50+c%150) + ", " + (c%50/50) + ")") }],
			["border", function (c) { return c%5 ? ((c%10) + "px " + (c%2?"solid":"dotted") + " " + (stylekeys[6][1](c))) : "" }]
		]
		var i, j, style, conf

		for (i=0; i<1000; i++) {
			style = {}
			for (j=0; j<i%10; j++) {
				conf = get(stylekeys, ++counter)
				style[conf[0]] = conf[1](counter)
			}
			styles[i] = style
		}

		this.count = 0
		this.app = function (index) {
			return mBinding("div",
				{
					class: get(classes, index),
					"data-index": index,
					title: index.toString(36)
				},
				mBinding("input", {type: "checkbox", checked: index % 3 == 0}),
				mBinding("input", {value: "test " + (Math.floor(index / 4)), disabled: index % 10 ? null : true}),
				mBinding("div", {class: get(classes, index * 11)},
					mBinding("p", {style: get(styles, index)}, "p1"),
					mBinding("p", {style: get(styles, index + 1)}, "p2"),
					mBinding("p", {style: get(styles, index * 2)}, "p3"),
					mBinding("p", {style: get(styles, index * 3 + 1)}, "p4")
				)
			);
		}
	},

	fn : function () {
		mBinding.render(scratch, this.app(++this.count))
	}
})

// Shared components for node recyling benchmarks
var Header = {
	view : function () {
		return mBinding("header",
			mBinding("h1", {class: "asdf"}, "a ", "b", " c ", 0, " d"),
			mBinding("nav",
				mBinding("a", {href: "/foo"}, "Foo"),
				mBinding("a", {href: "/bar"}, "Bar")
			)
		);
	}
}

var Form = {
	view : function () {
		return mBinding("form", {onSubmit: function onSubmit() {}},
			mBinding("input", {type: "checkbox", checked: true}),
			mBinding("input", {type: "checkbox", checked: false}),
			mBinding("fieldset",
				mBinding("label",
					mBinding("input", {type: "radio", checked: true})
				),
				mBinding("label",
					mBinding("input", {type: "radio"})
				)
			),
			mBinding(ButtonBar, null)
		);
	}
}

var ButtonBar = {
	view : function () {
		return mBinding("button-bar",
			mBinding(Button,
				{style: "width:10px; height:10px; border:1px solid #FFF;"},
				"Normal CSS"
			),
			mBinding(Button,
				{style: "top:0 ; right: 20"},
				"Poor CSS"
			),
			mBinding(Button,
				{style: "invalid-prop:1;padding:1px;font:12px/1.1 arial,sans-serif;", icon: true},
				"Poorer CSS"
			),
			mBinding(Button,
				{style: {margin: 0, padding: "10px", overflow: "visible"}},
				"Object CSS"
			)
		);
	}
}

var Button = {
	view : function (vnode) {
		return mBinding("button", vnode.attrs, vnode.children);
	}
}

var Main = {
	view : function () {
		return mBinding(Form);
	}
}

var Root = {
	view : function () {
		return mBinding("div",
			{class: "foo bar", "data-foo": "bar", p: 2},
			mBinding(Header, null),
			mBinding(Main, null)
		);
	}
}

suite.add({
	name : "repeated trees (recycling)",
	fn : function () {
		mBinding.render(scratch, [mBinding(Root)])
		mBinding.render(scratch, [])
	}
})

suite.add({
	name : "repeated trees (no recycling)",
	fn : function () {
		mBinding.render(scratch, [mBinding(Root)])
		mBinding.render(scratch, [])

		// Second empty render is to clear out the pool of nodes
		// so that there's nothing that can be recycled
		mBinding.render(scratch, [])
	}
})

suite.run({
	async : true
})
