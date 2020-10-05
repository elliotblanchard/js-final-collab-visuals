class CreatePlaylists < ActiveRecord::Migration[6.0]
  def change
    create_table :playlists do |t|
      t.belongs_to :seed, foreign_key: true

      t.timestamps       
    end
  end
end
