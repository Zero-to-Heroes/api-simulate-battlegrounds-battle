import { BoardEntity } from '../board-entity';

export class SharedState {
	public currentEntityId = 1;
	public deaths: BoardEntity[] = [];
	public debug: boolean = false;
}
