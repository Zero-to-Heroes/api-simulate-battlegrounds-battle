import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = null;
	state.forcedFaceOff = [
		// { attacker: { entityId: 7764 }, defender: { entityId: 9526 } },
		// { attacker: { entityId: 9523 }, defender: { entityId: 7764 } },
		// { attacker: { attack: 4, health: 1 }, defender: { entityId: 8519 } },
		// { attacker: { entityId: 7721 }, defender: { entityId: 9531 } },
		// { attacker: { entityId: 9531 }, defender: { entityId: 7764 } },
		// { attacker: { entityId: 7725 }, defender: { entityId: 9681 } },
	];
};
