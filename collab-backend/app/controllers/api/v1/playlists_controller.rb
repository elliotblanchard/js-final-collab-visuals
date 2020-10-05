class Api::V1::PlaylistsController < ApplicationController
    def index
        playlists = Playlist.all      
        render json: { playlist: PlaylistSerializer.new(playlists) }, status: :accepted
    end 

    def create
        playlist = Playlist.create(playlist_params)
        if playlist.valid?
            render json: { playlist: PlaylistSerializer.new(playlist) }, status: :created
        else
            render json: { errors: playlist.errors.full_messages }, status: :unprocessible_entity
        end
    end 

    def destroy
        playlist = Playlist.find(params[:id])
        render json: { playlist: PlaylistSerializer.new(playlist) }, status: :accepted  
        playlist.destroy      
    end    
    
    private

    def playlist_params
        params.require(:playlist).permit(:seed_id)
    end    
end