import { Race } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const BassgillPortrait: AfterOtherSpawnedCard = {
	cardIds: [TempCardIds.BassgillPortrait],
	afterOtherSpawned: (trinket: BoardTrinket, input: OnOtherSpawnInput) => {
		if (
			!hasCorrectTribe(
				input.spawned,
				input.hero,
				Race.MURLOC,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			return;
		}
		updateDivineShield(input.spawned, input.board, input.hero, input.otherHero, true, input.gameState);
	},
};
