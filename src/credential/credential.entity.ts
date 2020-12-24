import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Credentials')
export class CredentialEntity {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column()
  public userId: number;

  @Column()
  public iv: string;

  @Column({ type: 'text' })
  public data: string;

  @CreateDateColumn({ type: 'timestamp' })
  public lastModified: Date;
}
