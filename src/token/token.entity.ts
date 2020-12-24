import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Tokens')
export class TokenEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  public userId: number;

  @Column()
  public ip: string;

  @Column()
  public token: string;

  @Column()
  public active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  public date?: Date;
}
