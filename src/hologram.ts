import * as MRE from '@microsoft/mixed-reality-extension-sdk';

import { parseGuid, Guid } from '@microsoft/mixed-reality-extension-sdk';
import Authenticator from "./auth";
import {WorldData, AccessLevel } from "./saveData";

//const Universe :UniverseData = require(saveFile); // our json data with universal data. Each world will save data using their sessionID in here.


export default class Hologram {

	private self : MRE.Actor;
//	private baseURL : string;
	private spinAnimData : MRE.AnimationData;
	private auth : Authenticator;

    public constructor (private context: MRE.Context, private shouldRotate : boolean, private assets : MRE.AssetContainer, private url : string){
//		this.baseURL = url;
		this.auth = new Authenticator(this.context.sessionId);
		this.initWorldData();		
	}

	private async initWorldData(){
		for( const a of this.context.actors){
			a.destroy();
		}
		await this.auth.loadAuthData("./public/data.json");

		if(this.auth.getData() == undefined){
			console.error("No world data loaded!");
			this.createInNewWorld()
		}else{
			console.log("World data loaded. OWNER : " + this.auth.getData().owner);
			this.loadFromOldWorld();
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
					local: { position: { x: 0, y : -1, z: 0 } }
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
		if(this.auth.getData() == undefined){
			// first time initialization
			let data = ({} as WorldData);
			data.owner = userID.toString();
			// prompt for the user's initial data.

			// Save data
			console.log("Creating world data : " + JSON.stringify(data).toString());
			this.auth.setData(data); // set data to new world data
			this.auth.save();
			//this.saveData();
			// Update the owner
			this.getUser(data.owner).prompt("World has been sucessfully registered. Feel free to configure further. AS the owner, you have sole rights to configure this MRE, but if you add admins, they will have access to configure as well.");	
			this.initWorldData(); // reload object
		}else{
			// configuration management post init
			let access : AccessLevel;
			access = this.getAccessLevelGuid(userID);
			if(access == AccessLevel.Deny){
				this.getUser(userID.toString()).prompt("You do not have access to configure this object. Feel free to ask \"" + this.getUser(this.auth.getData().owner).name + "\" to list you as an admin if you think you shouold have access to configure this object.");
				return;
			}

			let s : string;
			let user : MRE.User = this.getUser(this.auth.getData().owner);
			s = (await user.prompt("Should rotate?", true)).text;
			let flag : Boolean;
			flag = eval(s); // evaluate a bool from the inpt
			if(flag){
				// start anim
			}else{	
				// stop anim

			}

			console.log(user.name + " says \"" + s + "\"");
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


	private  getGUID(s_guid : string) : Guid {
		return parseGuid(s_guid);
	}

	private getUser(s_guid : string) : MRE.User {
		return this.context.user(this.getGUID(s_guid));
	}


	private getAccessLevelGuid(guid : Guid) : AccessLevel { return this.auth.getAccessLevel(guid.toString());};

}