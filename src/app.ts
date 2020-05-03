import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import Hologram from "./hologram";

export default class HelloWorld {
	private assets: MRE.AssetContainer;
	private holo : Hologram;

	constructor(private context: MRE.Context, private baseUrl: string) {
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private async started() {

		this.assets = new MRE.AssetContainer(this.context);
		this.holo = new Hologram(this.context,  true, this.assets, this.baseUrl);

	}

}
