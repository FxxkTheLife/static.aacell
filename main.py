
import os


def get_all_files(path):
    all_files = []
    for dirpath, dirnames, filenames in os.walk(path):
        for name in filenames:
            all_files.append(os.path.join(dirpath, name))
    return all_files


if __name__ == '__main__':
    res = ''
    files = get_all_files('static/js/room')
    for file in files:
        if file.endswith('.js'):
            res += file + ' '
    os.system(f'uglifyjs {res} -c -m -o static/js/room/all.min.js')

