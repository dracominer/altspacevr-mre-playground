import * as MRE from '@microsoft/mixed-reality-extension-sdk';

import App from './app';

var fs = require("fs");

type WorldData = {
	owner : string;
	admins : string[];

	displayText : string;
	

}

interface UniverseData {
	[key:string] : WorldData;
}

const Universe :UniverseData = require("../public/data.json");

export default class Hologram {

	private self : MRE.Actor;
	private baseURL : string;
	private spinAnimData : MRE.AnimationData;
	private data : WorldData  = undefined;

    public constructor (private context: MRE.Context, private shouldRotate : boolean, private assets : MRE.AssetContainer, private url : string){
		this.baseURL = url;
		this.initWorldData();		
	}

	private async initWorldData(){
		let data : WorldData;

		data = Universe[this.context.sessionId];
		if(data == null){
			console.error("No world data loaded!")
		}else{
			console.log("World data loaded. OWNER : " + data.owner);
		}


		
	}

	private createInNewWorld(){
		// creates in a new world where there is no existing world data.

		this.self = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text-Root',
				transform: {
					app: { position: { x: 0, y: 0, z: 0 } }
				},
				text: {
					contents: "Click Button to Configure World",
					anchor: MRE.TextAnchorLocation.MiddleCenter,
					color: { r: 1, g: 1, b: 1 },
					height: 0.5
				}
			}
		});
		const buttonMesh = this.assets.createBoxMesh('button', 0.3, 0.3, 0.01);
			
		const button = MRE.Actor.Create(this.context, {
			actor: {
				parentId: this.self.id,
				name: "ConfigBtn",
				appearance: { meshId: buttonMesh.id },
				collider: { geometry: { shape: MRE.ColliderType.Auto } },
				transform: {
					local: { position: { x: 0, y : -.1, z: 0 } }
				}
			}
		});

		button.setBehavior(MRE.ButtonBehavior).onClick(user => this.OnConfig(user.id));
	}

	private loadFromOldWorld(){
		// creates in a world from old world data
		this.self = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text-Root',
				transform: {
					app: { position: { x: 0, y: 0, z: 0 } }
				},
				text: {
					contents: "Click Button to configure",
					anchor: MRE.TextAnchorLocation.MiddleCenter,
					color: { r: 1, g: 1, b: 1 },
					height: 0.5
				}
			}
		});

		
		// create rotation

		this.spinAnimData = this.assets.createAnimationData(
			// The name is a unique identifier for this data. You can use it to find the data in the asset container,
			// but it's merely descriptive in this sample.
			"Spin",
			{
				// Animation data is defined by a list of animation "tracks": a particular property you want to change,
				// and the values you want to change it to.
				tracks: [{
					// This animation targets the rotation of an actor named "text"
					target: MRE.ActorPath("text").transform.local.rotation,
					// And the rotation will be set to spin over N seconds
					keyframes: this.generateSpinKeyframes(120, MRE.Vector3.Up()),
					// And it will move smoothly from one frame to the next
					easing: MRE.AnimationEaseCurves.Linear
				}]
			});
		// Once the animation data is created, we can create a real animation from it.
		this.spinAnimData.bind(
			// We assign our text actor to the actor placeholder "text"
			{ text: this.self },
			// And set it to play immediately, and bounce back and forth from start to end
			{ isPlaying: true, wrapMode: MRE.AnimationWrapMode.Loop });
			
			const buttonMesh = this.assets.createBoxMesh('button', 0.3, 0.3, 0.01);
			
			const button = MRE.Actor.Create(this.context, {
				actor: {
					parentId: this.self.id,
					name: "ConfigBtn",
					appearance: { meshId: buttonMesh.id },
					collider: { geometry: { shape: MRE.ColliderType.Auto } },
					transform: {
						local: { position: { x: 0, y : -.1, z: 0 } }
					}
				}
			});

			button.setBehavior(MRE.ButtonBehavior).onClick(user => this.OnConfig(user.id));
	}


	private async OnConfig(userID : MRE.Guid){
		if(this.data == undefined){
			// first time initialization
			this.data = ({} as WorldData);
			this.data.owner = userID.toString();

		}else{
			// configuration management post init
		}
	}


    /**
	 * Generate keyframe data for a simple spin animation.
	 * @param duration The length of time in seconds it takes to complete a full revolution.
	 * @param axis The axis of rotation in local space.
	 */
	private generateSpinKeyframes(duration: number, axis: MRE.Vector3): Array<MRE.Keyframe<MRE.Quaternion>> {
		return [{
			time: 0 * duration,
			value: MRE.Quaternion.RotationAxis(axis, 0)
		}, {
			time: 0.25 * duration,
			value: MRE.Quaternion.RotationAxis(axis, Math.PI / 2)
		}, {
			time: 0.5 * duration,
			value: MRE.Quaternion.RotationAxis(axis, Math.PI)
		}, {
			time: 0.75 * duration,
			value: MRE.Quaternion.RotationAxis(axis, 3 * Math.PI / 2)
		}, {
			time: 1 * duration,
			value: MRE.Quaternion.RotationAxis(axis, 2 * Math.PI)
		}];
	}


}