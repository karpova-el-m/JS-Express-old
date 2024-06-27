import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Posts {
    @PrimaryGeneratedColumn()
    postId!: number;

    @Column({ type: "varchar", length: 30 })
    authorName!: string;

    @Column({ type: "varchar", length: 250 })
    title!: string;

    @Column({ type: "varchar", length: 30 })
    location!: string; 

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    publicationDate!: Date;
}