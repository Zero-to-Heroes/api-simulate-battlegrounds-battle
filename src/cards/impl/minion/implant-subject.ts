import { BgsPlayerEntity } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { OnDivineShieldUpdatedInput } from '../../../keywords/divine-shield';
import { OnRebornUpdatedInput } from '../../../keywords/reborn';
import { OnTauntUpdatedInput } from '../../../keywords/taunt';
import { FullGameState } from '../../../simulation/internal-game-state';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import {
	OnDivineShieldUpdatedCard,
	OnRebornUpdatedCard,
	OnStealthUpdatedCard,
	OnTauntUpdatedCard,
	OnVenomousUpdatedCard,
	OnWindfuryUpdatedCard,
} from '../../card.interface';

export const ImplantSubject: OnTauntUpdatedCard &
	OnDivineShieldUpdatedCard &
	OnVenomousUpdatedCard &
	OnWindfuryUpdatedCard &
	OnStealthUpdatedCard &
	OnRebornUpdatedCard = {
	cardIds: [TempCardIds.ImplantSubject, TempCardIds.ImplantSubject_G],
	onTauntUpdated: (
		entity: BoardEntity,
		impactedEntity: BoardEntity,
		previousValue: boolean,
		input: OnTauntUpdatedInput,
	) => {
		if (previousValue && !impactedEntity.taunt) {
			updateEntity(entity, input.board, input.hero, input.gameState);
		}
	},
	onDivineShieldUpdated: (entity: BoardEntity, input: OnDivineShieldUpdatedInput) => {
		if (input.previousValue && !input.target.divineShield) {
			updateEntity(entity, input.board, input.hero, input.gameState);
		}
	},
	onRebornUpdated: (
		entity: BoardEntity,
		impactedEntity: BoardEntity,
		previousValue: boolean,
		input: OnRebornUpdatedInput,
	) => {
		if (previousValue && !impactedEntity.reborn) {
			updateEntity(entity, input.board, input.hero, input.gameState);
		}
	},
	onStealthUpdated: (
		entity: BoardEntity,
		impactedEntity: BoardEntity,
		previousValue: boolean,
		input: OnRebornUpdatedInput,
	) => {
		if (previousValue && !impactedEntity.stealth) {
			updateEntity(entity, input.board, input.hero, input.gameState);
		}
	},
	onVenomousUpdated: (
		entity: BoardEntity,
		impactedEntity: BoardEntity,
		previousValue: boolean,
		input: OnRebornUpdatedInput,
	) => {
		if (previousValue && !impactedEntity.venomous) {
			updateEntity(entity, input.board, input.hero, input.gameState);
		}
	},
	onWindfuryUpdated: (
		entity: BoardEntity,
		impactedEntity: BoardEntity,
		previousValue: boolean,
		input: OnRebornUpdatedInput,
	) => {
		if (previousValue && !impactedEntity.windfury) {
			updateEntity(entity, input.board, input.hero, input.gameState);
		}
	},
};

const updateEntity = (entity: BoardEntity, board: BoardEntity[], hero: BgsPlayerEntity, gameState: FullGameState) => {
	const mult = entity.cardId === TempCardIds.ImplantSubject_G ? 2 : 1;
	modifyStats(entity, mult * 2, mult * 2, board, hero, gameState);
};
