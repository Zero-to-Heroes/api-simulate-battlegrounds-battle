import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 8800 }, defender: { entityId: 7495 } },
		{ attacker: { entityId: 8803 }, defender: { entityId: 7495 } },
		{ attacker: { entityId: 7506 }, defender: { entityId: 8797 } },
		{ attacker: { entityId: 8808 }, defender: { entityId: 6333 } },
		{ attacker: { entityId: 6333 }, defender: { entityId: 8811 } },
	];
};
