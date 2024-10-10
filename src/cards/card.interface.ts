import { BoardTrinket } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { SoCInput } from '../simulation/start-of-combat/start-of-combat-input';

export interface Card {
	startOfCombat?: (
		trinket: BoardEntity | BoardTrinket,
		input: SoCInput,
	) => boolean | { hasTriggered: boolean; shouldRecomputeCurrentAttacker: boolean };
}
export interface StartOfCombatCard extends Card {
	startOfCombat: NonNullable<Card['startOfCombat']>;
}
