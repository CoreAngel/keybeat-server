import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  public name: string;

  @Column({ unique: true })
  public login: string;

  @Column()
  public password: string;

  @Column()
  public salt: string;

  @Column()
  public toptSecret: string;

  @Column()
  public toptReset: string;

  @CreateDateColumn({ type: 'timestamp' })
  public lastModified?: Date;
}
