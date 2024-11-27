import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnOtherSpawnedCard } from '../../card.interface';

export const DeflectoBot: OnOtherSpawnedCard = {
	cardIds: [CardIds.DeflectOBot_BGS_071, CardIds.DeflectOBot_TB_BaconUps_123],
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		if (hasCorrectTribe(input.spawned, input.hero, Race.MECH, input.gameState.allCards)) {
			const statsBonus = minion.cardId === CardIds.DeflectOBot_TB_BaconUps_123 ? 4 : 2;
			if (!minion.divineShield) {
				updateDivineShield(minion, input.board, input.hero, input.otherHero, true, input.gameState);
			}
			modifyStats(minion, statsBonus, 0, input.board, input.hero, input.gameState);
			input.gameState.spectator.registerPowerTarget(minion, minion, input.board, input.hero, input.otherHero);
		}
	},
};
