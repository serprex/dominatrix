#include "domcore.h"

static FT_Library ftlib;

int ftinit(){
	return FT_Init_FreeType(&ftlib);
}

int ftface(FT_Face *face, const char *fontpath){
	int err = FT_New_Face(ftlib, fontpath, 0, face);
	if (err) return err;
	return FT_Set_Pixel_Sizes(*face, 0, 14);
}

int ftdrawtext(FT_Face face, int x, int y, const char *text){
	FT_GlyphSlot g = face->glyph;
	while (*text){
		int err = FT_Load_Char(face, *text, FT_LOAD_RENDER);
		if (err) continue;
		glTexImage2D(GL_TEXTURE_2D, 0, GL_RED,
			g->bitmap.width, g->bitmap.rows, 0,
			GL_RED, GL_UNSIGNED_BYTE, g->bitmap.buffer);
		float x2 = x + g->bitmap_left,
			y2 = y + g->bitmap_top,
			w = g->bitmap.width,
			h = g->bitmap.rows;
		GLfloat box[4][4] = {
			{x2, y2, 0, 0},
			{x2+w, y2, 1, 0},
			{x2, y2+h, 0, 1},
			{x2+w, y2+h, 1, 1},
		};
		glBufferData(GL_ARRAY_BUFFER, sizeof box, box, GL_DYNAMIC_DRAW);
		glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
		x += g->advance.x >> 6;
		y += g->advance.y >> 6;
		text++;
	}
	return 0;
}
