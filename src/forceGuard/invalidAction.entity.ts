import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ActionType } from './actionType.enum';

@Entity('InvalidActions')
export class InvalidActionEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  public ip: string;

  @Column({
    type: 'enum',
    enum: ActionType,
  })
  type: ActionType;

  @CreateDateColumn({ type: 'timestamp' })
  public date: Date;
}
