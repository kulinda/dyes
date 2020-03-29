import React from 'react';


export default class CanvasComponent extends React.PureComponent {
	constructor(props) {
		super(props);

		this.ctx = false;
		this._canvasref = this._canvasref.bind(this);
		this._paint = this._paint.bind(this);
		this._img_listeners = [];
	}

	_canvasref(ref) {
		this.ctx = false;
		if (ref) {
			let ctx = ref.getContext('2d');
			this.ctx = ctx;
			this._paint();
		}
	}

	waitForImage(img) {
		if (!img)
			return null;

		if (!img.complete) {
			if (this._img_listeners.indexOf(img) === -1) {
				img.addEventListener('load', this._paint, false);
				this._img_listeners.push(img);
			}
			return null;
		}

		return img;
	}

	_paint() {
		let ctx = this.ctx;
		if (ctx)
			this.paint(ctx);
	}

	componentWillUnmount() {
		this.ctx = false;
		for (let img of this._img_listeners) {
			img.removeEventListener('load', this._paint, false);
		}
	}

	componentDidUpdate() {
		this._paint();
	}

	render() {
		let w = this.props.width || 128;
		let h = this.props.height || 128;

		return <canvas width={w} height={h} ref={this._canvasref} onMouseOver={this.onMouseMove} onMouseMove={this.onMouseMove} onMouseOut={this.onMouseOut} onClick={this.onClick} />;
	}
}
