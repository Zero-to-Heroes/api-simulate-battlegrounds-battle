import { debugState } from '../../src/debug-state';
import { CardIds } from '../../src/services/card-ids';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 781 }, defender: { entityId: 982 } },
		{ attacker: { cardId: CardIds.TwilightWhelp }, defender: { entityId: 984 } },
		{ attacker: { entityId: 982 }, defender: { entityId: 855 } },
		{ attacker: { entityId: 10049 }, defender: { entityId: 10066 } },
	];
};
