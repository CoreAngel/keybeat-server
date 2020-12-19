import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column()
  public login: string;

  @Column()
  public password: string;

  @Column()
  public toptSecret: string;

  @Column()
  public toptReset: string;
}
