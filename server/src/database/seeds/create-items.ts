import Knex from 'knex'

export async function seed(knex: Knex) {
    const item = (title: string, image: string) => {
        return {
            title: title,
            image: image
        }
    }
    await knex('items').insert([
        item("Lâmpadas", 'lampadas.svg'),
        item("Pilhas e baterias", 'baterias.svg'),
        item("Papéis e Papelão", 'papeis-papelao.svg'),
        item("Resíduos Eletrônicos", 'eletronicos.svg'),
        item("Resíduos Orgânicos", 'organicos.svg'),
        item("Óleo de cozinha", 'oleo.svg')
    ]);
}