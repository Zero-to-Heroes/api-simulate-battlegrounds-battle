import { CardIds } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { removeAurasFromSelf } from '../../../simulation/add-minion-to-board';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { copyEntity } from '../../../utils';

export const RapidReanimation = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerEntity.heroPowerUsed) {
			// Getting the right enchantment can be tricky. The RapidReanimation enchantment can sometimes be
			// in the Graveyard zone, so we can't filter them out. In that case, we can have multiple
			// enchantments
			// However, because of how things are handled in the logs, we should be able to always take the one *
			// with the biggest entityId
			const minionThatWillDie = input.playerBoard
				.filter((m) =>
					m.enchantments.some((e) => e.cardId === CardIds.RapidReanimation_ImpendingDeathEnchantment),
				)
				.sort(
					(a, b) =>
						b.enchantments.find((e) => e.cardId === CardIds.RapidReanimation_ImpendingDeathEnchantment)
							.originEntityId -
							a.enchantments.find((e) => e.cardId === CardIds.RapidReanimation_ImpendingDeathEnchantment)
								.originEntityId || b.entityId - a.entityId,
				)[0];
			if (minionThatWillDie) {
				// So this is a bit tricky (as all the stuff with indices...). Because in practice it's more likely that players use Rapid Reanimation
				// on minions that they want to die quickly, most of the time they will be placed
				// to the left of the board
				// So using a left-based index (usually 0) is more likely to be correct after minions spawn on the board
				// Update: this looks like it's not the case, and looking at
				// http://replays.firestoneapp.com/?reviewId=2e6b389f-d904-43a2-a7cd-928a60d973ce&turn=11&action=1
				// the index seems to be right-based at least in some cases
				// Looks like even this is wrong:
				// http://replays.firestoneapp.com/?reviewId=9a46ab39-ccf0-478c-a010-68f2abb06c6f&turn=9&action=0
				const rapidReanimationIndexFromLeft = input.playerBoard.indexOf(minionThatWillDie);
				input.playerEntity.rapidReanimationIndexFromRight =
					input.playerBoard.length - 1 - rapidReanimationIndexFromLeft;
				const minionToCopy = copyEntity(minionThatWillDie);
				removeAurasFromSelf(minionToCopy, input.playerBoard, input.playerEntity, input.gameState);
				input.playerEntity.rapidReanimationMinion = minionToCopy;
				minionThatWillDie.definitelyDead = true;
				input.gameState.spectator.registerPowerTarget(
					input.playerEntity,
					minionThatWillDie,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
				return { hasTriggered: true, shouldRecomputeCurrentAttacker: true };
			}
		}
	},
};