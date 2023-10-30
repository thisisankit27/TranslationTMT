from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch

class TranslationModel:
    def __init__(self, model_repo, model_path, lang_token_mapping):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(model_repo)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_repo)
        self.lang_token_mapping = lang_token_mapping

        special_tokens_dict = {'additional_special_tokens': list(self.lang_token_mapping.values())}
        self.tokenizer.add_special_tokens(special_tokens_dict)
        self.model.resize_token_embeddings(len(self.tokenizer))
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.to(self.device)

    def translate_text(self, input_text, target_lang):
        target_lang_token = self.lang_token_mapping.get(target_lang, '<en>')
        input_text = f'{target_lang_token} {input_text}'
        input_ids = self.tokenizer.encode(input_text, return_tensors='pt', max_length=1000, truncation=True)
        input_ids = input_ids.to(self.device)
        with torch.no_grad():
            output = self.model.generate(input_ids, num_beams=4, max_length=1000, no_repeat_ngram_size=2)
        translated_text = self.tokenizer.decode(output[0], skip_special_tokens=True)
        return translated_text


# Create instances of the TranslationModel for each model you want to support

model1_repo = 'google/mt5-small'
model2_repo = 'google/mt5-small'
model3_repo = 'google/mt5-small'

model1_path = "C:/Users/thisi/OneDrive/Desktop/Models/mt5_translation(en-hi).pt"
model2_path = "C:/Users/thisi/OneDrive/Desktop/Models/mt5_translation(en-fr).pt"
model3_path = "C:/Users/thisi/OneDrive/Desktop/Models/mt5_translation(bn-en).pt"

model1_lang_mapping = {'en': '<en>', 'hi': '<hi>'}
model2_lang_mapping = {'en': '<en>', 'fr': '<fr>'}
model3_lang_mapping = {'bn': '<bn>', 'en': '<en>'}

translation_model1 = TranslationModel(model1_repo, model1_path, model1_lang_mapping)
translation_model2 = TranslationModel(model2_repo, model2_path, model2_lang_mapping)
translation_model3 = TranslationModel(model3_repo, model3_path, model3_lang_mapping)

@csrf_exempt
def translate(request):
    if request.method == 'GET':
        return render(request, 'translate.html')
    if request.method == 'POST':
        sentence = request.POST.get('sentence', '')
        target_lang = request.POST.get('target_lang', 'en')
        print(target_lang)
        # Choose the appropriate translation model based on your logic
        if target_lang in model1_lang_mapping:
            translated_text = translation_model1.translate_text(sentence, target_lang)
        elif target_lang in model2_lang_mapping:
            translated_text = translation_model2.translate_text(sentence, target_lang)
        elif target_lang in model3_lang_mapping:
            translated_text = translation_model3.translate_text(sentence, target_lang)
        else:
            translated_text = "Unsupported target language"

        return JsonResponse({'translated_text': translated_text})

    return JsonResponse({'error': 'Invalid request method'})