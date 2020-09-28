class CreateSeeds < ActiveRecord::Migration[6.0]
  def change
    create_table :seeds do |t|
      t.string :name
      t.string :matrix
      t.belongs_to :user, foreign_key: true

      t.timestamps      
    end
  end
end
